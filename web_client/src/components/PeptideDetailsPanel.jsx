import React from 'react';

const PeptideDetailsPanel = ({ peptide, analysisData, loading, isOpen, onClose }) => {
  if (!peptide) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-charcoal/95 backdrop-blur-xl border-l border-white/10 z-[100] transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <header className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">Deep Analysis</p>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{peptide.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Sequencing Intelligence...</p>
            </div>
          ) : (
            <>
              {/* Categorization */}
              <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Functional Classification</p>
                <div className="bg-white/5 p-6 border border-white/5 rounded-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-400/10 transition-colors duration-700" />
                  <h3 className="text-emerald-400 font-bold text-sm mb-2 uppercase tracking-wider relative z-10">
                    {analysisData?.metadata?.primary_category || peptide.category}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-4 relative z-10">
                    {(analysisData?.metadata?.sub_categories || []).map((sub, i) => (
                      <span key={i} className="text-[9px] px-2 py-1 bg-white/5 border border-white/10 text-white/60 uppercase tracking-widest rounded-full">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Physiochemical Radar (Stats) */}
              <section className="animate-in fade-in slide-in-from-right-8 duration-700">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Physiochemical Profile</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                    <p className="text-[9px] uppercase tracking-widest text-white/30">Net Charge (pH 7)</p>
                    <p className="text-xl font-mono text-white">
                      {analysisData?.physiochemical_properties?.net_charge_at_ph7 ?? 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                    <p className="text-[9px] uppercase tracking-widest text-white/30">Isoelectric Point</p>
                    <p className="text-xl font-mono text-white">
                      {analysisData?.physiochemical_properties?.isoelectric_point ?? 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                    <p className="text-[9px] uppercase tracking-widest text-white/30">MW (Da)</p>
                    <p className="text-xl font-mono text-white">
                      {analysisData?.physiochemical_properties?.molecular_weight ?? 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1 p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                    <p className="text-[9px] uppercase tracking-widest text-white/30">Hydrophobicity</p>
                    <p className="text-xl font-mono text-white">
                      {analysisData?.physiochemical_properties?.hydrophobicity_index ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Graph Connections */}
              <section>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-6">Structural Neighborhood</p>
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-3">Key Nodes</p>
                    <div className="flex flex-wrap gap-2">
                      {(analysisData?.graph_connections?.nodes || []).map((node, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span className="text-[10px] text-white/80 uppercase tracking-wider">{node}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-white/30 mb-3">Similar Bioactives</p>
                    <div className="flex flex-wrap gap-2">
                      {(analysisData?.graph_connections?.similar_peptides || []).map((pep, i) => (
                        <div key={i} className="px-3 py-2 border border-white/10 rounded-sm">
                          <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">{pep}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Full Sequence */}
              <section>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Primary Sequence</p>
                <div className="bg-obsidian p-4 font-mono text-[10px] break-all text-white/40 leading-relaxed border border-white/5 select-all">
                  {peptide.sequence_one_letter}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeptideDetailsPanel;
