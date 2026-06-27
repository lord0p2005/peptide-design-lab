import React from 'react';

const WikiView = ({ peptide, loading, onSelectPeptide, peptides = [] }) => {
  if (loading) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-obsidian">
        <div className="text-white text-xs uppercase tracking-[0.5em] animate-pulse">Consulting Archives...</div>
      </div>
    );
  }

  if (!peptide) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center">
          <p className="text-white/20 uppercase tracking-[0.4em] mb-4">Registry Standby</p>
          <div className="h-px w-12 bg-white/10 mx-auto"></div>
        </div>
      </div>
    );
  }

  const wiki = peptide.wiki_content || {
    summary: peptide.clinical_use || "No summary available.",
    mechanism: peptide.molecular_target || "Mechanism of action currently under investigation.",
    effects: ["Primary biological evaluation in progress."],
    synergies: []
  };

  const handleSynergyClick = (name) => {
    const target = peptides.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (target && onSelectPeptide) {
      onSelectPeptide(target);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-obsidian text-neutral-200 font-serif selection:bg-white selection:text-black scroll-smooth">
      <div className="max-w-4xl mx-auto px-8 py-32">
        {/* Editorial Header */}
        <header className="mb-24 relative">
          <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-transparent to-transparent hidden md:block"></div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-white/40"></div>
            <span className="text-[10px] font-sans uppercase tracking-[0.4em] text-white/40">
              Research Dossier
            </span>
            <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-cyan-400/60 bg-cyan-400/5 px-2 py-0.5 rounded">
              {peptide.id}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase mb-6 leading-[0.85]">
            {peptide.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-neutral-500 font-sans italic">
            <span className="text-lg">{peptide.category}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
            <span className="text-sm uppercase tracking-widest">{peptide.market_trend}</span>
          </div>
        </header>

        {/* Technical Sequence Block */}
        <div className="mb-24 group">
            <div className="flex justify-between items-end mb-4 px-1">
                <h3 className="text-[9px] font-sans font-bold uppercase tracking-[0.3em] text-white/30">Primary Sequence</h3>
                <span className="text-[9px] font-mono text-white/20 uppercase">{peptide.sequence_one_letter.length} Amino Acid Residues</span>
            </div>
            <div className="bg-neutral-900/50 border border-white/5 p-6 md:p-8 rounded-sm group-hover:border-white/10 transition-colors">
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {peptide.sequence_one_letter.split('').map((aa, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span className="text-2xl md:text-3xl font-sans font-black text-white/80">{aa}</span>
                            <span className="text-[8px] font-mono text-white/20 mt-1 uppercase">pos.{i+1}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Content Body */}
        <div className="space-y-24">
          {/* Abstract */}
          <section>
            <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-white/20 mb-8 flex items-center gap-4">
              <span className="w-2 h-2 bg-white/20 rounded-full"></span>
              Abstract
            </h2>
            <p className="text-xl md:text-2xl leading-relaxed text-neutral-300 font-light first-letter:text-7xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:text-white first-letter:leading-none">
              {wiki.summary}
            </p>
          </section>

          {/* Molecular Pharmacology */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5 pt-12">
            <div className="md:col-span-1">
                <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-white/20 mb-4">
                    Pharmacology
                </h2>
                <p className="text-xs text-neutral-500 font-sans leading-relaxed uppercase tracking-wider">
                    Detailed molecular interaction and receptor-site targeting mechanism.
                </p>
            </div>
            <div className="md:col-span-2">
                <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-neutral-400 italic border-l-4 border-white/10 pl-8">
                        {wiki.mechanism}
                    </p>
                </div>
            </div>
          </section>

          {/* Clinical Insights */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
              <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-white/20 mb-8">
                Physiological Effects
              </h2>
              <ul className="space-y-6">
                {wiki.effects.map((effect, i) => (
                  <li key={i} className="group flex gap-6">
                    <span className="font-sans text-[10px] text-white/20 group-hover:text-cyan-400 transition-colors mt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-base text-neutral-400 group-hover:text-neutral-200 transition-colors">
                      {effect}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-12">
               <div>
                <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-white/20 mb-8">
                    Adverse Profile
                </h2>
                <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-sm">
                    <p className="text-sm text-neutral-400 italic leading-relaxed">
                        {peptide.reported_side_effects || "Exhibits minimal adverse interference under standard experimental protocols."}
                    </p>
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-sans font-black uppercase tracking-[0.5em] text-white/20 mb-8">
                    Synergies
                </h2>
                <div className="flex flex-wrap gap-2">
                    {wiki.synergies && wiki.synergies.length > 0 ? (
                    wiki.synergies.map((syn, i) => (
                        <button
                            key={i}
                            onClick={() => handleSynergyClick(syn)}
                            className="px-4 py-2 bg-white/5 border border-white/5 hover:border-cyan-400/50 hover:bg-cyan-400/5 transition-all rounded-sm text-[10px] font-sans font-black text-white/60 hover:text-white uppercase tracking-widest"
                        >
                            {syn}
                        </button>
                    ))
                    ) : (
                    <p className="text-xs italic text-neutral-500">Cross-linking potential currently unmapped.</p>
                    )}
                </div>
              </div>
            </div>
          </section>

          {/* Specifications Footer */}
          <footer className="pt-24 border-t border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
              <SpecItem label="Molecular Formula" value={peptide.chemical_formula} />
              <SpecItem label="Weight / Da" value={peptide.physiochemical_metrics?.molecular_weight || "N/A"} />
              <SpecItem label="Isoelectric Pt" value={peptide.physiochemical_metrics?.isoelectric_point || "N/A"} />
              <SpecItem label="Net Charge" value={peptide.physiochemical_metrics?.net_charge_at_ph7 || "N/A"} />
            </div>

            <div className="text-center">
                <div className="inline-block p-4 border border-white/5 rounded-full mb-8">
                    <svg className="w-6 h-6 text-white/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
                        <path d="M12 6V12L16 14" />
                    </svg>
                </div>
                <p className="text-[9px] font-sans uppercase tracking-[0.8em] text-white/10">
                    Proprietary Data Transmission • Lab Standard 402-A
                </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

const SpecItem = ({ label, value }) => (
  <div>
    <p className="text-[8px] font-sans uppercase tracking-[0.3em] text-white/20 mb-2">{label}</p>
    <p className="text-sm font-mono text-white/60 truncate">{value}</p>
  </div>
);

export default WikiView;
