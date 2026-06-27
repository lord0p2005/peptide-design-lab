import React from 'react';

export default function PeptideLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-obsidian">
      <svg className="w-48 h-48" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Subtle gold gradient to mimic the logo styling */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8a6d1c" />
          </linearGradient>
        </defs>

        <style>{`
          .node {
            animation: floatNode 4s ease-in-out infinite alternate;
            fill: url(#goldGrad);
          }
          .bond {
            stroke: #6b5a2e;
            stroke-width: 2;
            stroke-linecap: round;
            opacity: 0.4;
            animation: floatNode 4s ease-in-out infinite alternate;
          }

          /* Staggering animations to create a chaotic, natural molecular movement */
          .n1 { animation-delay: 0s; --dx: 6px; --dy: -4px; }
          .n2 { animation-delay: -1s; --dx: -5px; --dy: 7px; }
          .n3 { animation-delay: -2s; --dx: 4px; --dy: 5px; }
          .n4 { animation-delay: -3s; --dx: -6px; --dy: -5px; }

          /* Bonds between nodes */
          .b1-4 { animation-delay: -0.5s; --dx: 2px; --dy: 2px; }
          .b2-4 { animation-delay: -1.5s; --dx: -2px; --dy: -2px; }
          .b3-4 { animation-delay: -2.5s; --dx: 3px; --dy: -3px; }

          @keyframes floatNode {
            0% { transform: translate(0px, 0px); }
            100% { transform: translate(var(--dx), var(--dy)); }
          }
        `}</style>

        {/* Outer Connection Bounds */}
        <g>
          {/* Bonds */}
          <line className="bond b1-4" x1="60" y1="60" x2="100" y2="85" />
          <line className="bond b2-4" x1="140" y1="70" x2="100" y2="85" />
          <line className="bond b3-4" x1="100" y1="130" x2="100" y2="85" />

          {/* Node 1 */}
          <circle className="node n1" cx="60" cy="60" r="8" />
          {/* Node 2 */}
          <circle className="node n2" cx="140" cy="70" r="10" />
          {/* Node 3 */}
          <circle className="node n3" cx="100" cy="130" r="9" />
          {/* Center Hub Node */}
          <circle className="node n4" cx="100" cy="85" r="7" />
        </g>
      </svg>

      {/* Sleek, minimalist text below */}
      <h2 className="mt-6 font-sans text-xs tracking-[0.3em] text-white/40 uppercase animate-pulse">
        Initializing Pipeline...
      </h2>
    </div>
  );
}
