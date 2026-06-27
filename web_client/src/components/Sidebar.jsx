import React from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ peptides, selectedPeptideId, onSelectPeptide, searchTerm, onSearchChange, isOpen, toggleSidebar }) => {
  return (
    <div className="h-full flex flex-col bg-charcoal">
      <div className="p-6">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 text-white hover:text-white/70 transition-colors group mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <h1 className="text-xl font-bold tracking-tighter uppercase">
            Peptide Lab
          </h1>
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search peptides..."
            className="w-full bg-obsidian border border-white/20 rounded-none px-4 py-2 text-sm focus:outline-none focus:border-white transition-colors text-white"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {peptides.map((peptide, index) => (
          <motion.button
            key={peptide.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02, duration: 0.5, ease: "easeOut" }}
            onClick={() => onSelectPeptide(peptide)}
            className={`w-full text-left p-6 border-b border-white/5 transition-all hover:bg-white/5 ${
              selectedPeptideId === peptide.id ? 'bg-white/10 border-r-2 border-r-white' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {peptide.name}
              </h3>
              <span className="px-1.5 py-0.5 bg-white/5 text-[9px] uppercase tracking-tighter text-white/60">
                {peptide.sequence_one_letter.length} AA
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3">
              {peptide.market_trend}
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-1">Clinical Use</p>
                <p className="text-[11px] leading-tight text-white/70 line-clamp-2 italic">
                  {peptide.clinical_use}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-1">Reported Side Effects</p>
                <p className="text-[11px] leading-tight text-white/60 line-clamp-2">
                  {peptide.reported_side_effects}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
