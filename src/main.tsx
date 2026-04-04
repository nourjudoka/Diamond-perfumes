import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import brandLogo from "../DIAMOND LOGO (1).png";

const ensureFavicon = () => {
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = brandLogo;
};

ensureFavicon();

createRoot(document.getElementById("root")!).render(<App />);
