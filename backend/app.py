import base64
import json
import os
from threading import Lock

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sock import Sock
from ultralytics import YOLO

from utils.prediction import build_prediction_payload, extract_best_prediction


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best.pt")

app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)
sock = Sock(app)

model_lock = Lock()
device = "cuda:0" if cv2.cuda.getCudaEnabledDeviceCount() > 0 else "cpu"
model = None
model_error = None
if os.path.exists(MODEL_PATH):
    try:
        model = YOLO(MODEL_PATH)
        model.to(device)
    except Exception as exc:  # noqa: BLE001
        model_error = str(exc)
else:
    model_error = f"Model file not found at: {MODEL_PATH}"

GIF_MAP = {
    chr(code): f"/static/gifs/{chr(code)}.gif" for code in range(ord("A"), ord("Z") + 1)
}


def decode_base64_image(image_data: str) -> np.ndarray:
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]
    image_bytes = base64.b64decode(image_data)
    np_buffer = np.frombuffer(image_bytes, dtype=np.uint8)
    frame = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Failed to decode image.")
    return frame


def parse_frame_from_request() -> np.ndarray:
    if request.files.get("frame"):
        raw = request.files["frame"].read()
        np_buffer = np.frombuffer(raw, dtype=np.uint8)
        frame = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Uploaded frame is not a valid image.")
        return frame

    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image")
    if not image_data:
        raise ValueError("Missing 'image' field in request body.")
    return decode_base64_image(image_data)


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "device": device,
            "model_loaded": model is not None,
            "model_error": model_error,
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": model_error or "Model not loaded."}), 500

    try:
        frame = parse_frame_from_request()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    with model_lock:
        results = model.predict(frame, verbose=False, device=device)

    label, confidence = extract_best_prediction(results)
    payload = build_prediction_payload(label, confidence, GIF_MAP)
    return jsonify(payload)


@sock.route("/ws/predict")
def ws_predict(ws):
    while True:
        message = ws.receive()
        if message is None:
            break
        try:
            if model is None:
                ws.send(json.dumps({"error": model_error or "Model not loaded."}))
                continue
            frame = decode_base64_image(message)
            with model_lock:
                results = model.predict(frame, verbose=False, device=device)
            label, confidence = extract_best_prediction(results)
            ws.send(json.dumps(build_prediction_payload(label, confidence, GIF_MAP)))
        except Exception as exc:  # noqa: BLE001
            ws.send(json.dumps({"error": str(exc)}))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
