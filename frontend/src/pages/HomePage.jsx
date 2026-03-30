import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className="page">
      <div className="hero card">
        <h1>VAANI</h1>
        <p className="subtitle">
          Vision-based Automatic Accessible Neural Interpreter for Sign Language
        </p>
        <p>
          VAANI bridges communication gaps by translating Indian Sign Language
          alphabets into readable text and visual finger-spelling guidance.
        </p>
        <Link to="/live" className="primary-btn">
          Go to Live Detection
        </Link>
      </div>

      <div className="grid">
        <article className="card">
          <h2>Introduction</h2>
          <p>
            This application captures webcam frames and runs YOLO-based inference
            to detect ISL alphabets in real time.
          </p>
        </article>

        <article className="card">
          <h2>Motivation</h2>
          <p>
            Fast sign-to-text interpretation improves accessibility for
            education, healthcare, and day-to-day communication.
          </p>
        </article>

        <article className="card">
          <h2>Features</h2>
          <ul>
            <li>Real-time ISL alphabet detection</li>
            <li>Confidence-aware predictions</li>
            <li>Finger spelling GIF visualization</li>
            <li>Text accumulation, speech and download</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export default HomePage;
