import { useEffect } from "react";

export const useKeyboardShortcuts = ({ onUndo, onRedo, onDownloadAll }) => {
  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo?.();
        } else {
          onUndo?.();
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        onDownloadAll?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onUndo, onRedo, onDownloadAll]);
};
