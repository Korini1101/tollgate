"use client";

import { useEffect, useRef } from "react";

// A flowing, undulating wave field rendered on canvas.
// Evokes a stream of value moving through the gate.
export default function WaveField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Wave layers, each with its own amplitude, wavelength, speed, color.
    const layers = [
      { amp: 42, len: 0.0042, speed: 0.00022, y: 0.62, color: "rgba(39,117,202,0.30)" },
      { amp: 58, len: 0.0030, speed: 0.00016, y: 0.70, color: "rgba(0,245,255,0.16)" },
      { amp: 34, len: 0.0055, speed: 0.00030, y: 0.78, color: "rgba(91,155,213,0.20)" },
      { amp: 72, len: 0.0022, speed: 0.00012, y: 0.86, color: "rgba(0,148,255,0.10)" },
    ];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const layer of layers) {
        ctx.beginPath();
        ctx.moveTo(0, height);
        const baseY = height * layer.y;
        for (let x = 0; x <= width; x += 6) {
          const y =
            baseY +
            Math.sin(x * layer.len + t * layer.speed) * layer.amp +
            Math.sin(x * layer.len * 0.5 + t * layer.speed * 1.7) * layer.amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - layer.amp, 0, height);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, "rgba(10,14,26,0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    if (prefersReduced) {
      draw(0); // render one static frame
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}
