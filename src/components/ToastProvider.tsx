"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#131929",
          color: "#ffffff",
          border: "1px solid #2A3350",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: { primary: "#00C853", secondary: "#131929" },
        },
        error: {
          iconTheme: { primary: "#FF3B5C", secondary: "#131929" },
        },
      }}
    />
  );
}
