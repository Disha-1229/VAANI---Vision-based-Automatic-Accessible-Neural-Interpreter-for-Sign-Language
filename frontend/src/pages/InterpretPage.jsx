import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { predictFrame } from "../api";

const CAPTURE_INTERVAL_MS = 500;
const CONFIDENCE_THRESHOLD = 0.8;
const BUFFER_SIZE = 6;

/** Map model class names for “space” to a single buffer token. */
function canonicalPredictionLabel(label) {
  if (label == null || label === "") return null;
  const s = String(label).trim();
  const u = s.toUpperCase();
  if (
    u === "SPACE" ||
    u === "SP" ||
    u === "BLANK" ||
    u === "_" ||
    s === " "
  ) {
    return "SPACE";
  }
  if (/^[A-Za-z]$/.test(s)) return s.toUpperCase();
  return u;
}

/** Token used in buffer → single character appended to output (space → actual blank). */
function tokenToOutputChar(token) {
  if (token === "SPACE") return " ";
  if (token && /^[A-Z]$/.test(token)) return token;
  return token || "";
}

function InterpretPage() {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
  const predictionBufferRef = useRef([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latestLabel, setLatestLabel] = useState("-");
  const [latestConfidence, setLatestConfidence] = useState(0);
  const [outputText, setOutputText] = useState("");
  const [lastAcceptedLabel, setLastAcceptedLabel] = useState(null);

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

  const addPredictedLetter = (label, confidence) => {
    const canonical = canonicalPredictionLabel(label);
    if (!canonical || confidence < CONFIDENCE_THRESHOLD) {
      return;
    }

    predictionBufferRef.current.push(canonical);
    if (predictionBufferRef.current.length < BUFFER_SIZE) {
      return;
    }

    const frequencyMap = predictionBufferRef.current.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    let majorityToken = null;
    let majorityCount = 0;
    Object.entries(frequencyMap).forEach(([token, count]) => {
      if (count > majorityCount) {
        majorityToken = token;
        majorityCount = count;
      }
    });

    if (!majorityToken) {
      predictionBufferRef.current = [];
      return;
    }

    const outChar = tokenToOutputChar(majorityToken);
    if (!outChar) {
      predictionBufferRef.current = [];
      return;
    }

    // Space: always append a real blank; reset dedupe so consecutive spaces are allowed.
    if (majorityToken === "SPACE") {
      setOutputText((prev) => prev + " ");
      setLastAcceptedLabel(null);
      predictionBufferRef.current = [];
      return;
    }

    // Letters: avoid repeating the same letter until another symbol is committed.
    if (majorityToken !== lastAcceptedLabel) {
      setOutputText((prev) => prev + outChar);
      setLastAcceptedLabel(majorityToken);
    }

    predictionBufferRef.current = [];
  };

  const captureAndPredict = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      return;
    }

    try {
      setLoading(true);
      const data = await predictFrame(imageSrc);
      setError("");
      const raw = data?.label;
      const canon = canonicalPredictionLabel(raw);
      setLatestLabel(
        canon === "SPACE" ? "(space)" : raw != null && raw !== "" ? String(raw) : "-"
      );
      setLatestConfidence(Number(data?.confidence || 0));
      addPredictedLetter(data?.label, Number(data?.confidence || 0));
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Unable to get prediction. Ensure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const startDetection = () => {
    if (isDetecting) {
      return;
    }
    setError("");
    setIsDetecting(true);
    intervalRef.current = setInterval(captureAndPredict, CAPTURE_INTERVAL_MS);
  };

  const clearOutput = () => {
    setOutputText("");
    setLastAcceptedLabel(null);
    predictionBufferRef.current = [];
  };

  const copyOutput = async () => {
    if (!outputText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
    } catch (_err) {
      setError("Clipboard permission denied.");
    }
  };

  const speakOutput = () => {
    if (!outputText) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(outputText);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section className="page">
      <h1 className="page-title">Interpret</h1>
      <div className="split-layout">
        <div className="card panel">
          <h2>Live Camera Input</h2>
          <div className="camera-frame">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
              mirrored
              videoConstraints={{ width: 640, height: 420, facingMode: "user" }}
            />
          </div>
          <div className="actions">
            <button className="primary-btn" onClick={startDetection}>
              Start
            </button>
            <button className="secondary-btn" onClick={stopDetection}>
              Stop
            </button>
          </div>
        </div>

        <div className="card panel">
          <h2>Output</h2>
          {loading && <p className="status">Interpreting live gesture...</p>}
          {error && <p className="error">{error}</p>}
          <p>
            <strong>Current Prediction:</strong> {latestLabel}
          </p>
          <p>
            <strong>Confidence:</strong> {(latestConfidence * 100).toFixed(2)}%
          </p>
          <p className="status">Minimum confidence threshold: 80%</p>
          <div className="output-area">{outputText || "Detected text will appear here..."}</div>
          <div className="actions">
            <button className="secondary-btn" onClick={copyOutput}>
              Copy
            </button>
            <button className="secondary-btn" onClick={speakOutput}>
              Speak
            </button>
            <button className="secondary-btn" onClick={clearOutput}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InterpretPage;
