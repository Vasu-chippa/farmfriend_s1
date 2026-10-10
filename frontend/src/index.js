import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application error boundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f8fafc", color: "#111827" }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ margin: 0, color: "#4b5563" }}>Please refresh the page and try again.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
try {
  document.documentElement.style.overflowY = "auto";
  document.body.style.overflowY = "auto";
  document.documentElement.style.overscrollBehavior = "auto";
} catch (e) {
  // ignore in non-browser environments
}

root.render(
  <ErrorBoundary>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
