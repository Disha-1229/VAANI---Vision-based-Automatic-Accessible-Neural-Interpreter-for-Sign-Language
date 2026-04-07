import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { predictFrame } from "../api";

const CAPTURE_INTERVAL_MS = 500;
const CONFIDENCE_THRESHOLD = 0.45;
const REPEAT_WINDOW = 3;

function LiveDetectionPage() {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [prediction, setPrediction] = useState({
    label: null,
    confidence: 0,
    gif_url: null,
  });
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAcceptedLabel, setLastAcceptedLabel] = useState(null);
  const [repeatCount, setRepeatCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => stopDetection();
  }, []);

  const stopDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsDetecting(false);
    setLoading(false);
  };

  const acceptPrediction = (label, confidence) => {
    if (!label || confidence < CONFIDENCE_THRESHOLD) {
      return;
    }

    if (label === lastAcceptedLabel) {
      if (repeatCount >= REPEAT_WINDOW) {
        return;
      }
      setRepeatCount((prev) => prev + 1);
    } else {
      setLastAcceptedLabel(label);
      setRepeatCount(1);
      setOutputText((prev) => prev + label);
    }
  };

  const captureAndPredict = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      return;
    }

    try {
      setLoading(true);
      const data = await predictFrame(imageSrc);
      setPrediction(data);
      setError("");
      acceptPrediction(data.label, data.confidence);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Prediction failed. Ensure backend is running and model is available."
      );
    } finally {
      setLoading(false);
    }
  };

  const startDetection = () => {
    if (isDetecting) {
      return;
    }
    setIsDetecting(true);
    setError("");
    intervalRef.current = setInterval(captureAndPredict, CAPTURE_INTERVAL_MS);
  };

  const clearText = () => {
    setOutputText("");
    setLastAcceptedLabel(null);
    setRepeatCount(0);
  };

  const speakText = () => {
    if (!outputText) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(outputText);
    window.speechSynthesis.speak(utterance);
  };

  const downloadText = () => {
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vaani-output.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const confidencePct = prediction.confidence
    ? (prediction.confidence * 100).toFixed(2)
    : 0;

  return (
    <section className="page live-page">

      {/* ── LEFT: Webcam ── */}
      <div className="card webcam-card">
        <h2>Live ISL Detection</h2>
        <div className="camera-frame">
          {isDetecting && <span className="recording-dot" />}
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
            mirrored
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
          />
        </div>
        <p className="status cam-status">
          {isDetecting ? "● Detecting…" : "Camera idle"}
        </p>
        <div className="actions">
          <button className="primary-btn" onClick={startDetection} disabled={isDetecting}>
            Start Detection
          </button>
          <button className="secondary-btn" onClick={stopDetection} disabled={!isDetecting}>
            Stop
          </button>
        </div>
      </div>

      {/* ── RIGHT: Results ── */}
      <div className="card result-card">
        <h2>Prediction Output</h2>

        {error && <p className="error">{error}</p>}

        {/* Prediction chip */}
        <div className="prediction-chip">
          <span className="prediction-letter">
            {prediction.label || "–"}
          </span>
          <div className="prediction-meta">
            <span className="prediction-meta-label">Detected Alphabet</span>
            <span className="prediction-meta-value">
              {loading ? "Processing frame…" : prediction.label || "Waiting…"}
            </span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="confidence-wrap">
          <div className="confidence-label">
            <span>Confidence</span>
            <span>{confidencePct}%</span>
          </div>
          <div className="confidence-track">
            <div
              className="confidence-fill"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        {/* GIF preview */}
        <div className="gif-view">
          {prediction.gif_url ? (
            <img
              src={`http://localhost:5000${prediction.gif_url}`}
              alt={`Finger spelling ${prediction.label}`}
            />
          ) : (
            <p className="status">No GIF available</p>
          )}
        </div>

        {/* Accumulated text */}
        <div className="output-box">
          <p className="output-box-label">Accumulated Text</p>
          <div className="text-output">{outputText || "—"}</div>
        </div>

        <div className="actions">
          <button className="secondary-btn" onClick={clearText} disabled={!outputText}>
            Clear
          </button>
          <button className="secondary-btn" onClick={downloadText} disabled={!outputText}>
            Download
          </button>
          <button className="secondary-btn" onClick={speakText} disabled={!outputText}>
            Speak
          </button>
        </div>
      </div>

    </section>
  );
}

export default LiveDetectionPage;