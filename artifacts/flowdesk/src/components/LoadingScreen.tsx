import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = [
      "99 102 241",
      "139 92 246",
      "79 110 247",
      "168 85 247",
    ];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  const letters = "FlowDesk".split("");

  useEffect(() => {
    const steps = [
      { target: 20, delay: 300 },
      { target: 45, delay: 600 },
      { target: 72, delay: 900 },
      { target: 91, delay: 1200 },
      { target: 100, delay: 1600 },
    ];

    steps.forEach(({ target, delay }) => {
      setTimeout(() => setProgress(target), delay);
    });

    setTimeout(() => {
      setPhase("done");
      setTimeout(onComplete, 600);
    }, 2200);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "hsl(230, 13%, 5%)" }}
        >
          <ParticleCanvas />

          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(243, 75%, 65%, 0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative mb-2"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(243,75%,65%) 0%, hsl(280,70%,62%) 100%)",
                  boxShadow: "0 0 40px hsl(243,75%,65%,0.35), 0 0 80px hsl(243,75%,65%,0.12)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M7 14h14M14 7l7 7-7 7"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Wordmark */}
            <div className="flex items-center gap-0.5">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.05,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="text-3xl font-semibold tracking-tight"
                  style={{
                    color: "hsl(210, 20%, 92%)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="text-sm font-medium tracking-widest uppercase"
              style={{ color: "hsl(210, 12%, 42%)", letterSpacing: "0.15em" }}
            >
              Command Center
            </motion.p>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 }}
              className="w-56 flex flex-col gap-2"
            >
              <div
                className="w-full h-px rounded-full overflow-hidden"
                style={{ background: "hsl(228, 12%, 15%)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(243,75%,65%) 0%, hsl(280,70%,62%) 100%)",
                    boxShadow: "0 0 8px hsl(243,75%,65%,0.6)",
                    width: `${progress}%`,
                    transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <motion.span
                  className="text-xs"
                  style={{ color: "hsl(210, 12%, 35%)" }}
                >
                  {progress < 30
                    ? "Initializing system..."
                    : progress < 60
                    ? "Loading components..."
                    : progress < 90
                    ? "Connecting services..."
                    : "Ready"}
                </motion.span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "hsl(243, 75%, 65%)" }}
                >
                  {progress}%
                </span>
              </div>
            </motion.div>
          </div>

          {/* Version */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 text-xs"
            style={{ color: "hsl(210, 12%, 28%)" }}
          >
            v1.0.0 — Professional Edition
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
