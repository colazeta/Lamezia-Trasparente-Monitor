import { createRoot } from "react-dom/client";
import App from "./App";
import { configureGeneratedApiClient } from "./lib/apiBaseUrl";
import "./index.css";

configureGeneratedApiClient();

createRoot(document.getElementById("root")!).render(<App />);
