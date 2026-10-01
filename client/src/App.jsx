import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Content from "./pages/Content.jsx";
import Assignments from "./pages/Assignments.jsx";
import Playlists from "./pages/Playlists.jsx";
import Publish from "./pages/Publish.jsx";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/content">Content</Link> |{" "}
        <Link to="/assignments">Assignments</Link> |{" "}
        <Link to="/playlists">Playlists</Link> |{" "}
        <Link to="/publish">Publish</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/content" element={<Content />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/publish" element={<Publish />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
