import { Link, Route, Routes } from "react-router-dom";
import AboutPage from "./pages/AboutPage";
import GeneratePage from "./pages/GeneratePage";
import InterpretPage from "./pages/InterpretPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="brand">
          VAANI
        </Link>
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/interpret">Interpret</Link>
          <Link to="/generate">Generate</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/interpret" element={<InterpretPage />} />
          <Route path="/generate"  element={<GeneratePage />} />
          <Route path="/about"     element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;