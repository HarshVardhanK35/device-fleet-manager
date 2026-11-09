import "./polyfills.js";
import { installScreenLog } from "./utils/screenLog/screenLog.js";

// The pages a screen runs keep a log the owner can pull (Player page, "Pull logs").
if (window.location.pathname === "/screens" || window.location.pathname.startsWith("/player/")) {
  installScreenLog();
}
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./index.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
