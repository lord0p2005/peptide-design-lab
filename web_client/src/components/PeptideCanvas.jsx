import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PeptideCanvas = ({ peptide, aiData, aiLoading }) => {
  if (!peptide) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-obsidian">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/10 uppercase tracking-[0.5em] text-[10px]"
        >
          Select a sequence to initiate visualization
        </motion.p>
      </div>
    );
  }

  const mrnaBlocks = peptide.genetic_mapping.mrna.split(' ');
  const codingBlocks = peptide.genetic_mapping.coding_dna.split(' ');
  const templateBlocks = peptide.genetic_mapping.template_dna.split(' ');

  const blockWidth = "w-20";
  const labelWidth = "w-32";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-obsidian p-8 md:p-20 custom-scrollbar">
      <motion.div
        key={peptide.id}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto pt-12"
      >
        <header className="mb-24">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4">Sequence Specification</p>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9] max-w-3xl">
                {peptide.name}
              </h2>
            </div>
            <div className="md:text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-2">Primary Application</p>
              <p className="text-sm font-bold text-white tracking-tight uppercase">{peptide.market_trend}</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 border-t border-white/5 pt-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4">Therapeutic Profile</p>
              <p className="text-base leading-relaxed text-white/70 italic font-light">{peptide.clinical_use}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4">Side Effects & Risk</p>
              <p className="text-base leading-relaxed text-white/70 font-light">{peptide.reported_side_effects}</p>
            </div>
          </motion.div>
        </header>

        <motion.section variants={itemVariants} className="mb-24">
          <div className="flex justify-between items-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Genetic Mapping</p>
            {peptide.chemical_formula && (
              <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                 <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest">{peptide.chemical_formula}</span>
              </div>
            )}
          </div>

          <div className="bg-charcoal/20 border border-white/5 p-8 md:p-12 overflow-x-auto rounded-3xl backdrop-blur-sm">
            <div className="min-w-max">
              <div className="flex items-center mb-20">
                <div className={`${labelWidth} text-[9px] uppercase tracking-[0.3em] text-white/20 shrink-0`}>Polypeptide Chain</div>
                <div className="flex gap-6">
                  {peptide.sequence_three_letter.map((aa, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      className={`${blockWidth} flex flex-col items-center relative shrink-0`}
                    >
                      <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center bg-charcoal hover:border-white/40 hover:bg-white/5 transition-all duration-500 group cursor-crosshair shadow-2xl">
                        <span className="text-[11px] font-black font-mono text-white group-hover:scale-110 transition-transform">{aa}</span>
                      </div>
                      <div className="mt-3 text-[10px] font-mono text-white/30 font-bold">
                        {peptide.sequence_one_letter[index] || '?'}
                      </div>
                      {index < peptide.sequence_three_letter.length - 1 && (
                        <div className="absolute top-8 -right-8 w-10 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-8 opacity-60 hover:opacity-100 transition-opacity duration-700">
                <div className="flex gap-6 items-center">
                  <div className={`${labelWidth} text-[9px] uppercase tracking-[0.3em] text-white/10 shrink-0`}>mRNA</div>
                  <div className="flex gap-6">
                    {mrnaBlocks.map((block, i) => (
                      <div key={i} className={`${blockWidth} text-center text-[10px] font-mono text-cyan-400/60 shrink-0 tracking-widest font-medium`}>{block}</div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 items-center">
                  <div className={`${labelWidth} text-[9px] uppercase tracking-[0.3em] text-white/10 shrink-0`}>Coding DNA</div>
                  <div className="flex gap-6">
                    {codingBlocks.map((block, i) => (
                      <div key={i} className={`${blockWidth} text-center text-[10px] font-mono text-emerald-400/60 shrink-0 tracking-widest font-medium`}>{block}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="mb-24">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-10">AI Biophysical Profiling (ESM-2)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Molecular Weight", value: aiData?.molecular_weight || peptide.molecular_weight, unit: "g/mol", color: "text-white" },
              { label: "Isoelectric Point", value: aiData?.isoelectric_point, unit: "pH", color: "text-white" },
              { label: "Hydrophobicity", value: aiData?.hydrophobicity, unit: "", color: "text-white" },
              { label: "Serum Stability", value: aiData?.serum_stability_score, unit: "%", color: "text-emerald-400" }
            ].map((prop, i) => (
              <div key={i} className="bg-charcoal/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-2xl">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 mb-3 group-hover:text-white/40 transition-colors">{prop.label}</p>
                <div className="flex items-baseline gap-1">
                  <p className={`text-2xl font-black font-mono ${prop.color}`}>
                    {aiLoading ? "..." : (prop.value || "N/A")}
                  </p>
                  {prop.unit && <span className="text-[10px] text-white/10 font-mono">{prop.unit}</span>}
                </div>
                {prop.label === "Serum Stability" && !aiLoading && prop.value && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prop.value}%` }}
                    className="absolute bottom-0 left-0 h-1 bg-emerald-500/20"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="pb-20">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">Molecular Mechanism</p>
          <div className="bg-charcoal/50 border border-white/5 p-10 rounded-3xl border-l-4 border-l-white/20 shadow-2xl">
            <p className="text-xl leading-relaxed text-white/90 font-light italic tracking-tight">
              "{peptide.molecular_target}"
            </p>
          </div>
        </motion.section>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default PeptideCanvas;
