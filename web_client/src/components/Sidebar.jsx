import React from 'react';
import { motion } from 'framer-motion';

const Sidebar = ({ peptides, selectedPeptideId, onSelectPeptide, searchTerm, onSearchChange, isOpen, toggleSidebar }) => {
  return (
    <div className="h-full flex flex-col bg-charcoal">
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
            <h1 className="text-xs font-black tracking-[0.4em] uppercase text-white/90">
              Lab
            </h1>
          </motion.div>

          <button
            onClick={toggleSidebar}
            className="p-2 text-white/30 hover:text-white transition-all group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search sequences..."
            className="w-full bg-obsidian/50 border border-white/5 rounded-full px-5 py-2.5 text-[11px] uppercase tracking-widest focus:outline-none focus:border-white/20 transition-all text-white placeholder:text-white/10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-8">
        <div className="space-y-1 mt-4">
          {peptides.map((peptide, index) => (
            <motion.button
              key={peptide.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelectPeptide(peptide)}
              className={`w-full text-left p-5 rounded-2xl transition-all duration-500 group relative overflow-hidden ${
                selectedPeptideId === peptide.id
                  ? 'bg-white shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-[11px] font-black uppercase tracking-wider transition-colors ${
                    selectedPeptideId === peptide.id ? 'text-obsidian' : 'text-white/80'
                  }`}>
                    {peptide.name}
                  </h3>
                  <span className={`text-[9px] font-mono transition-colors ${
                    selectedPeptideId === peptide.id ? 'text-obsidian/40' : 'text-white/20'
                  }`}>
                    {peptide.sequence_one_letter.length}AA
                  </span>
                </div>

                <p className={`text-[9px] uppercase tracking-[0.2em] mb-4 transition-colors ${
                  selectedPeptideId === peptide.id ? 'text-obsidian/60' : 'text-white/30'
                }`}>
                  {peptide.market_trend.split(' / ')[0]}
                </p>

                <div className={`h-[1px] w-full mb-4 transition-colors ${
                  selectedPeptideId === peptide.id ? 'bg-obsidian/5' : 'bg-white/5'
                }`} />

                <p className={`text-[10px] leading-relaxed line-clamp-2 transition-colors ${
                  selectedPeptideId === peptide.id ? 'text-obsidian/70 font-medium' : 'text-white/50 italic'
                }`}>
                  {peptide.clinical_use}
                </p>
              </div>

              {selectedPeptideId !== peptide.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
