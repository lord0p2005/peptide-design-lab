import React, { useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const PeptideGraph = ({ peptides, onSelectPeptide }) => {
  const CATEGORIES = {
    "Neuro-Regenerative & Nootropic Agents": ["memory", "cognitive", "brain", "focus", "neuro", "neuroprotective", "Semax", "Selank", "MEH", "SEL"],
    "Tissue-Repair & Angiogenic Modulators": ["healing", "repair", "angiogenesis", "wound", "tendon", "gastric", "recovery", "BPC", "GHK"],
    "Metabolic & Mitochondrial Homeostasis Regulators": ["metabolism", "mitochondrial", "AMPK", "insulin", "glucose", "ATP", "exercise", "MOTS-c"],
    "Secretagogues & Somatotropic Analogues": ["growth hormone", "secretagogue", "pituitary", "GHRH", "GH", "Ipamorelin"],
    "Cosmeceutical & Epicutaneous Actives": ["wrinkle", "dermal", "skin", "collagen", "anti-aging", "topical", "Argireline"]
  };

  const getAffinities = (peptide) => {
    const text = `${peptide.name} ${peptide.clinical_use} ${peptide.sequence_one_letter} ${peptide.category}`.toLowerCase();
    const affinities = [];
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
        affinities.push(category);
      }
    }
    // If no keywords match, use the original category
    if (affinities.length === 0) {
        affinities.push(peptide.category || 'Experimental & Unclassified Bioactives');
    }
    return [...new Set(affinities)];
  };

  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const categoriesSet = new Set();

    peptides.forEach(peptide => {
      const affinities = getAffinities(peptide);

      nodes.push({
        id: peptide.id,
        name: peptide.name,
        type: 'peptide',
        val: 2,
        color: affinities.length > 1 ? '#fbbf24' : '#ffffff' // Amber-400 for cross-links
      });

      affinities.forEach(category => {
        categoriesSet.add(category);
        links.push({
          source: category,
          target: peptide.id,
          strength: affinities.length > 1 ? 0.5 : 1
        });
      });
    });

    categoriesSet.forEach(category => {
      nodes.push({
        id: category,
        name: category,
        type: 'category',
        val: 6,
        color: '#4ade80' // emerald-400
      });
    });

    return { nodes, links };
  }, [peptides]);

  const handleNodeClick = useCallback((node) => {
    if (node.type === 'peptide') {
      const peptide = peptides.find(p => p.id === node.id);
      if (peptide) onSelectPeptide(peptide);
    }
  }, [peptides, onSelectPeptide]);

  return (
    <div className="w-full h-full bg-obsidian relative">
      <div className="absolute top-6 left-6 z-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">System Topology</p>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Peptide Mind Map</h2>
      </div>

      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeRelSize={6}
        nodeColor={node => node.color}
        linkColor={() => 'rgba(255, 255, 255, 0.05)'}
        backgroundColor="#050505"
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = node.type === 'category' ? 14 / globalScale : 10 / globalScale;
          ctx.font = `${node.type === 'category' ? 'bold' : 'normal'} ${fontSize}px Inter, sans-serif`;

          // Draw node
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.type === 'category' ? 5 : 2.5, 0, 2 * Math.PI, false);
          ctx.fill();

          if (node.type === 'peptide' && node.color === '#fbbf24') {
              ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
          }

          // Draw label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = node.color;
          ctx.globalAlpha = 0.8;
          ctx.fillText(label, node.x, node.y + (node.type === 'category' ? 10 : 8));
          ctx.globalAlpha = 1.0;
        }}
        cooldownTicks={100}
        d3VelocityDecay={0.3}
      />

      <div className="absolute bottom-6 left-6 z-10 flex gap-6 bg-charcoal/50 backdrop-blur-md p-4 border border-white/5 rounded-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[9px] uppercase tracking-widest text-white/60">Functional Hubs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[9px] uppercase tracking-widest text-white/60">Standard Nodes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[9px] uppercase tracking-widest text-white/60">Cross-Link Affinities</span>
        </div>
      </div>
    </div>
  );
};

export default PeptideGraph;
