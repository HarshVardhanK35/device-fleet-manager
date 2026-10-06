import { BrowserRouter, Routes, Route } from "react-router-dom";

// all pages here
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Content from "./pages/Content.jsx";
import Assignments from "./pages/Assignments.jsx";
import Playlists from "./pages/Playlists.jsx";
import Publish from "./pages/Publish.jsx";
import Player from "./pages/Player.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/player/:deviceId" element={<Player />} />

        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/content"
          element={
            <Layout>
              <Content />
            </Layout>
          }
        />
        <Route
          path="/assignments"
          element={
            <Layout>
              <Assignments />
            </Layout>
          }
        />
        <Route
          path="/playlists"
          element={
            <Layout>
              <Playlists />
            </Layout>
          }
        />
        <Route
          path="/publish"
          element={
            <Layout>
              <Publish />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
