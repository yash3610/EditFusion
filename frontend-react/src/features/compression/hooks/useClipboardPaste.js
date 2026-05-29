import { useEffect } from "react";

export const useClipboardPaste = (onFiles) => {
  useEffect(() => {
    const handler = (event) => {
      const items = Array.from(event.clipboardData?.items || []);
      const files = items
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter(Boolean);
      if (files.length) {
        onFiles(files);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [onFiles]);
};
