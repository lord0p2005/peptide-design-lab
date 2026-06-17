import React from 'react';

const Sidebar = ({ peptides, selectedPeptideId, onSelectPeptide, searchTerm, onSearchChange }) => {
  return (
    <div className="w-96 h-screen bg-charcoal border-r border-white/10 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tighter uppercase mb-6 text-white">
          Peptide Lab
        </h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search peptides..."
            className="w-full bg-obsidian border border-white/20 rounded-none px-4 py-2 text-sm focus:outline-none focus:border-white transition-colors"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {peptides.map((peptide) => (
          <button
            key={peptide.id}
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
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
