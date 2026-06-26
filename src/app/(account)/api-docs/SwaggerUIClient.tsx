"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: { spec: object; domNode: HTMLElement }) => void;
  }
}

export function SwaggerUIClient({ spec }: { spec: object }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.onload = () => {
      window.SwaggerUIBundle?.({ spec, domNode: container });
    };
    document.body.appendChild(script);

    return () => {
      cssLink.remove();
      script.remove();
      container.innerHTML = "";
    };
  }, [spec]);

  return <div ref={ref} />;
}
