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
    if (affinities.length === 0) {
        affinities.push(peptide.category || 'Experimental & Unclassified Bioactives');
    }
    return [...new Set(affinities)];
  };

  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const categoriesSet = new Set();

    nodes.push({
      id: 'PEPTIDE_CORE',
      name: 'CORE',
      type: 'root',
      val: 12,
      color: '#ffffff'
    });

    peptides.forEach(peptide => {
      const affinities = getAffinities(peptide);

      nodes.push({
        id: peptide.id,
        name: peptide.name,
        type: 'peptide',
        val: 3,
        color: affinities.length > 1 ? '#fbbf24' : '#ffffff'
      });

      affinities.forEach(category => {
        categoriesSet.add(category);
        links.push({
          source: category,
          target: peptide.id,
          strength: 0.8
        });
      });
    });

    categoriesSet.forEach(category => {
      nodes.push({
        id: category,
        name: category,
        type: 'category',
        val: 7,
        color: '#4ade80'
      });

      links.push({
        source: 'PEPTIDE_CORE',
        target: category,
        strength: 0.3
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
    <div
      className="w-full h-full bg-obsidian relative"
    >
      <div className="absolute top-12 left-12 z-10">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 mb-4">Topology Explorer</p>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Mind Map</h2>
      </div>

      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeRelSize={6}
        nodeColor={node => node.color}
        linkColor={() => 'rgba(255, 255, 255, 0.03)'}
        linkWidth={1}
        backgroundColor="#050505"
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          if (!node || typeof node.x === 'undefined') return;

          const label = node.name;
          let fontSize = 11 / globalScale;
          let radius = 3;
          let fontWeight = 'normal';

          if (node.type === 'root') {
            fontSize = 18 / globalScale;
            radius = 8;
            fontWeight = '900';
          } else if (node.type === 'category') {
            fontSize = 13 / globalScale;
            radius = 5;
            fontWeight = 'bold';
          }

          ctx.font = `${fontWeight} ${fontSize}px sans-serif`;

          if (node.type !== 'peptide' || node.color === '#fbbf24') {
            try {
              const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
              gradient.addColorStop(0, `${node.color}22`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius * 4, 0, 2 * Math.PI, false);
              ctx.fill();
            } catch (e) {}
          }

          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fill();

          if (globalScale > 1.5 || node.type !== 'peptide') {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.4;
            ctx.fillText(label.toUpperCase(), node.x, node.y + radius + (10 / globalScale));
            ctx.globalAlpha = 1.0;
          }
        }}
        cooldownTicks={150}
        d3VelocityDecay={0.4}
        d3AlphaDecay={0.01}
        d3Force={(d3) => {
          d3.force('charge').strength(-200);
          d3.force('link').distance(link => link.source.type === 'root' ? 180 : 100);
        }}
      />

      <div className="absolute bottom-12 right-12 z-10 flex flex-col gap-4 items-end">
        {[
          { color: 'bg-emerald-400', label: 'Functional Hubs' },
          { color: 'bg-white', label: 'Standard Sequences' },
          { color: 'bg-amber-400', label: 'Cross-Affinities' }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-charcoal/30 backdrop-blur-xl px-5 py-2.5 border border-white/5 rounded-full">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{item.label}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeptideGraph;
