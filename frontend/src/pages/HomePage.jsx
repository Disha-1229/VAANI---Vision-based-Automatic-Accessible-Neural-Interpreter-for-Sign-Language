import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="page">

      {/* ── Hero ── */}
      <div className="home-hero">
        <div className="home-hero-text">
          <p className="home-subtitle">Vision · Language · Accessibility</p>
          <h1 className="home-title">VAANI</h1>
          <p className="home-desc">
            A unified platform that bridges Indian Sign Language users and
            non-signing individuals through real-time gesture recognition,
            multilingual translation, and AI-powered communication.
          </p>
          <div className="home-actions">
            <Link to="/interpret" className="primary-btn">
              ▶ Start Interpreting
            </Link>
            <Link to="/about" className="secondary-btn">
              Learn More
            </Link>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="hand-art">🤟</div>
        </div>
      </div>

      {/* ── Feature cards ── */}
      <div className="home-features">
        <Link to="/interpret" className="feature-card">
          <div className="feat-icon"></div>
          <h3>Live Detection</h3>
          <p>
            Experience real-time Indian Sign Language (ISL) alphabet detection powered by a YOLO-based deep learning model.
            The system captures webcam input, detects hand gestures instantly, and displays predictions with confidence scores.
            It also provides a dynamic finger-spelling GIF preview for better visual understanding, ensuring smooth and interactive communication support.
          </p>
        </Link>

        <Link to="/generate" className="feature-card">
          <div className="feat-icon"></div>
          <h3>Generate</h3>
          <p>
            Convert any English text into animated ISL finger-spelling sequences with ease.
            Each character is transformed into its corresponding gesture and displayed as a GIF, allowing step-by-step visualization.
            Users can download individual letter animations or full sequences, making it ideal for learning, teaching, and accessibility applications.
          </p>
        </Link>
      </div>

    </section>
  );
}

export default HomePage;