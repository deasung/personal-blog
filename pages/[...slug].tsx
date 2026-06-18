'use client';

import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";

export default function CatchAll() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div></div>;
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  );
}