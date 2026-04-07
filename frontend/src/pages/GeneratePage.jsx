import { useMemo, useState } from "react";
import { getGifUrl } from "../api";

function GeneratePage() {
  const [inputText, setInputText] = useState("");
  const [generatedLetters, setGeneratedLetters] = useState([]);

  const previews = useMemo(
    () =>
      generatedLetters.map((letter, index) => ({
        key: `${letter}-${index}`,
        letter,
        src: getGifUrl(letter),
      })),
    [generatedLetters]
  );

  const generateFromText = () => {
    const letters = (inputText.match(/[A-Za-z]/g) || []).map((char) =>
      char.toUpperCase()
    );
    setGeneratedLetters(letters);
  };

  const downloadGifs = () => {
    previews.forEach((preview, index) => {
      if (!preview.src) {
        return;
      }
      const link = document.createElement("a");
      link.href = preview.src;
      link.download = `${index + 1}_${preview.letter}.gif`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    });
  };

  const clearAll = () => {
    setInputText("");
    setGeneratedLetters([]);
  };

  return (
    <section className="page">
      <h1 className="page-title">Generate</h1>
      <div className="split-layout">

        {/* ── LEFT: Input ── */}
        <div className="card panel">
          <h2>Text Input</h2>
          <p className="status" style={{ marginBottom: "12px" }}>
            Enter any English text. Only letters A–Z are converted to ISL finger spelling.
          </p>
          <textarea
            className="text-input"
            placeholder="Type text to generate visual ISL sequence..."
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
          {inputText && (
            <p className="char-count status">
              {(inputText.match(/[A-Za-z]/g) || []).length} letter
              {(inputText.match(/[A-Za-z]/g) || []).length !== 1 ? "s" : ""} will be generated
            </p>
          )}
          <div className="actions">
            <button
              className="primary-btn"
              onClick={generateFromText}
              disabled={!inputText.trim()}
            >
              Generate GIF Sequence
            </button>
            <button
              className="secondary-btn"
              onClick={clearAll}
              disabled={!inputText && generatedLetters.length === 0}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ── RIGHT: Output GIFs ── */}
        <div className="card panel">
          <div className="output-header">
            <h2>Generated Output</h2>
            {previews.length > 0 && (
              <span className="letter-badge">{previews.length} signs</span>
            )}
          </div>

          <div className="gif-grid">
            {previews.length === 0 ? (
              <p className="muted">Generated GIF output will appear here.</p>
            ) : (
              previews.map((preview) => (
                <div className="gif-tile" key={preview.key}>
                  <p>{preview.letter}</p>
                  <img src={preview.src} alt={`ISL ${preview.letter}`} />
                </div>
              ))
            )}
          </div>

          <div className="actions">
            <button
              className="secondary-btn"
              onClick={downloadGifs}
              disabled={previews.length === 0}
            >
              Download GIFs
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default GeneratePage;