import React from 'react';

const PeptideCanvas = ({ peptide, aiData, aiLoading }) => {
  if (!peptide) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-obsidian">
        <p className="text-white/20 uppercase tracking-[0.2em] animate-pulse">
          Select a peptide to visualize
        </p>
      </div>
    );
  }

  const mrnaBlocks = peptide.genetic_mapping.mrna.split(' ');
  const codingBlocks = peptide.genetic_mapping.coding_dna.split(' ');
  const templateBlocks = peptide.genetic_mapping.template_dna.split(' ');

  // Standard width for blocks and beads to ensure alignment
  const blockWidth = "w-20";
  const labelWidth = "w-32";

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-obsidian p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 border-b border-white/10 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Molecular Profile</p>
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">{peptide.name}</h2>
            </div>
            <div className="md:text-right">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">Market Trend</p>
              <p className="text-sm font-medium text-white">{peptide.market_trend}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Clinical Use</p>
              <p className="text-sm leading-relaxed text-white/80 italic">{peptide.clinical_use}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Side Effects</p>
              <p className="text-sm leading-relaxed text-white/80">{peptide.reported_side_effects}</p>
            </div>
          </div>
        </header>

        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Sequence Visualization</p>
            {peptide.chemical_formula && (
              <div className="bg-white/5 px-3 py-1 border border-white/10 rounded-full">
                 <p className="text-[9px] uppercase tracking-widest text-white/60 inline-block mr-2">Formula:</p>
                 <span className="text-xs font-mono text-cyan-400 font-bold">{peptide.chemical_formula}</span>
              </div>
            )}
          </div>

          {/* Main Visualization Container */}
          <div className="bg-charcoal/30 border border-white/5 p-6 md:p-10 overflow-x-auto rounded-sm">
            <div className="min-w-max">

              {/* Amino Acid String of Beads */}
              <div className="flex items-center mb-16">
                <div className={`${labelWidth} text-[10px] uppercase tracking-widest text-white/30 shrink-0`}>Primary Sequence</div>
                <div className="flex gap-4">
                  {peptide.sequence_three_letter.map((aa, index) => (
                    <div key={index} className={`${blockWidth} flex flex-col items-center relative shrink-0`}>
                      <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center bg-charcoal hover:border-white transition-all duration-300">
                        <span className="text-[10px] font-bold font-mono text-white">{aa}</span>
                      </div>
                      <div className="mt-2 text-[10px] font-mono text-white/40">
                        {peptide.sequence_one_letter[index] || '?'}
                      </div>
                      {index < peptide.sequence_three_letter.length - 1 && (
                        <div className="absolute top-7 -right-6 w-8 h-[1px] bg-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-white/5 w-full mb-10" />

              {/* Genetic Mapping Blocks */}
              <div className="space-y-6">
                <div className="flex gap-4 items-center">
                  <div className={`${labelWidth} text-[10px] uppercase tracking-widest text-white/30 shrink-0`}>Amino Acid</div>
                  <div className="flex gap-4">
                    {peptide.sequence_three_letter.map((aa, i) => (
                      <div key={i} className={`${blockWidth} text-center text-xs font-mono font-bold text-white/90 shrink-0`}>{aa}</div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className={`${labelWidth} text-[10px] uppercase tracking-widest text-white/30 shrink-0`}>mRNA</div>
                  <div className="flex gap-4">
                    {mrnaBlocks.map((block, i) => (
                      <div key={i} className={`${blockWidth} text-center text-[11px] font-mono text-cyan-400/80 shrink-0 tracking-tighter`}>{block}</div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className={`${labelWidth} text-[10px] uppercase tracking-widest text-white/30 shrink-0`}>Coding DNA</div>
                  <div className="flex gap-4">
                    {codingBlocks.map((block, i) => (
                      <div key={i} className={`${blockWidth} text-center text-[11px] font-mono text-emerald-400/80 shrink-0 tracking-tighter`}>{block}</div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className={`${labelWidth} text-[10px] uppercase tracking-widest text-white/30 shrink-0`}>Template DNA</div>
                  <div className="flex gap-4">
                    {templateBlocks.map((block, i) => (
                      <div key={i} className={`${blockWidth} text-center text-[11px] font-mono text-rose-400/80 shrink-0 tracking-tighter`}>{block}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-8">AI Intelligence Layer (ESM-2)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-charcoal/50 border border-white/5 p-6 rounded-sm">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Molecular Weight</p>
              <p className="text-xl font-mono text-white">
                {aiLoading ? "..." : (aiData?.molecular_weight || peptide.molecular_weight || "N/A")}
                <span className="text-[10px] ml-1 text-white/20">g/mol</span>
              </p>
            </div>
            <div className="bg-charcoal/50 border border-white/5 p-6 rounded-sm">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Isoelectric Point</p>
              <p className="text-xl font-mono text-white">
                {aiLoading ? "..." : (aiData?.isoelectric_point || "N/A")}
                <span className="text-[10px] ml-1 text-white/20">pH</span>
              </p>
            </div>
            <div className="bg-charcoal/50 border border-white/5 p-6 rounded-sm">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Hydrophobicity</p>
              <p className="text-xl font-mono text-white">
                {aiLoading ? "..." : (aiData?.hydrophobicity || "N/A")}
              </p>
            </div>
            <div className="bg-charcoal/50 border border-white/5 p-6 rounded-sm relative overflow-hidden">
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">Serum Stability</p>
              <p className="text-xl font-mono text-emerald-400">
                {aiLoading ? "..." : (aiData?.serum_stability_score ? `${aiData.serum_stability_score}%` : "N/A")}
              </p>
              {!aiLoading && aiData?.serum_stability_score && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-emerald-500/30 transition-all duration-1000"
                  style={{ width: `${aiData.serum_stability_score}%` }}
                />
              )}
            </div>
          </div>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Molecular Target</p>
          <div className="bg-charcoal border border-white/5 p-8 border-l-2 border-l-white">
            <p className="text-base leading-relaxed text-white/90 font-light italic">
              "{peptide.molecular_target}"
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PeptideCanvas;
