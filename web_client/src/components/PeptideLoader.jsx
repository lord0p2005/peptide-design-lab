import React from 'react';
import { motion } from 'framer-motion';

export default function PeptideLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-obsidian overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <svg className="w-64 h-64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8a6d1c" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <style>{`
            .node {
              animation: floatNode 6s ease-in-out infinite alternate;
              fill: url(#goldGrad);
              filter: url(#glow);
            }
            .bond {
              stroke: #6b5a2e;
              stroke-width: 1.5;
              stroke-linecap: round;
              opacity: 0.3;
              animation: floatNode 6s ease-in-out infinite alternate;
            }

            .n1 { animation-delay: 0s; --dx: 8px; --dy: -6px; }
            .n2 { animation-delay: -1.5s; --dx: -7px; --dy: 9px; }
            .n3 { animation-delay: -3s; --dx: 6px; --dy: 8px; }
            .n4 { animation-delay: -4.5s; --dx: -8px; --dy: -7px; }

            .b1-4 { animation-delay: -0.7s; --dx: 3px; --dy: 3px; }
            .b2-4 { animation-delay: -2.2s; --dx: -3px; --dy: -3px; }
            .b3-4 { animation-delay: -3.7s; --dx: 4px; --dy: -4px; }

            @keyframes floatNode {
              0% { transform: translate(0px, 0px) scale(1); }
              50% { transform: translate(calc(var(--dx) / 2), calc(var(--dy) / 2)) scale(1.05); }
              100% { transform: translate(var(--dx), var(--dy)) scale(1); }
            }
          `}</style>

          <g>
            <line className="bond b1-4" x1="60" y1="60" x2="100" y2="85" />
            <line className="bond b2-4" x1="140" y1="70" x2="100" y2="85" />
            <line className="bond b3-4" x1="100" y1="130" x2="100" y2="85" />

            <circle className="node n1" cx="60" cy="60" r="7" />
            <circle className="node n2" cx="140" cy="70" r="9" />
            <circle className="node n3" cx="100" cy="130" r="8" />
            <circle className="node n4" cx="100" cy="85" r="6" />
          </g>
        </svg>

        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/20 rounded-full"
            animate={{
              rotate: 360,
              x: [100, 120, 100],
              y: [0, 20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5
            }}
            style={{ originX: "-50px", originY: "-50px" }}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="flex flex-col items-center"
      >
        <h2 className="mt-8 font-sans text-[10px] tracking-[0.5em] text-white/30 uppercase">
          Initializing Pipeline
        </h2>
        <div className="mt-4 w-32 h-[1px] bg-white/5 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
