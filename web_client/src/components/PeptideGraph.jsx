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

    // Add a central index node for the "Obsidian" look
    nodes.push({
      id: 'PEPTIDE_CORE',
      name: 'PEPTIDE LAB',
      type: 'root',
      val: 8,
      color: '#ffffff'
    });

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
          strength: 0.8
        });
      });
    });

    categoriesSet.forEach(category => {
      nodes.push({
        id: category,
        name: category,
        type: 'category',
        val: 5,
        color: '#4ade80' // emerald-400
      });

      // Connect categories to the root node
      links.push({
        source: 'PEPTIDE_CORE',
        target: category,
        strength: 0.3
      });
    });

    // Add similarity links between peptides
    for (let i = 0; i < peptides.length; i++) {
      for (let j = i + 1; j < peptides.length; j++) {
        const p1 = peptides[i];
        const p2 = peptides[j];
        const aff1 = getAffinities(p1);
        const aff2 = getAffinities(p2);

        // Count shared affinities
        const shared = aff1.filter(a => aff2.includes(a));
        if (shared.length >= 2) {
          links.push({
            source: p1.id,
            target: p2.id,
            type: 'similarity',
            strength: 0.1
          });
        }
      }
    }

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
        linkColor={link => link.type === 'similarity' ? 'rgba(251, 191, 36, 0.05)' : 'rgba(255, 255, 255, 0.05)'}
        linkWidth={link => link.type === 'similarity' ? 0.5 : 1}
        backgroundColor="#050505"
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node, ctx, globalScale) => {
          if (!node || typeof node.x === 'undefined') return;

          const label = node.name;
          let fontSize = 10 / globalScale;
          let radius = 2.5;
          let fontWeight = 'normal';

          if (node.type === 'root') {
            fontSize = 16 / globalScale;
            radius = 6;
            fontWeight = '900';
          } else if (node.type === 'category') {
            fontSize = 12 / globalScale;
            radius = 4;
            fontWeight = 'bold';
          }

          ctx.font = `${fontWeight} ${fontSize}px sans-serif`;

          // Draw node glow
          if (node.type !== 'peptide' || node.color === '#fbbf24') {
            try {
              const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3);
              gradient.addColorStop(0, `${node.color}33`);
              gradient.addColorStop(1, 'transparent');
              ctx.fillStyle = gradient;
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius * 3, 0, 2 * Math.PI, false);
              ctx.fill();
            } catch (e) {}
          }

          // Draw node
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fill();

          if (node.type === 'peptide' && node.color === '#fbbf24') {
              ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
              ctx.lineWidth = 2 / globalScale;
              ctx.stroke();
          }

          // Draw label
          if (globalScale > 1.2 || node.type !== 'peptide') {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.6;
            ctx.fillText(label, node.x, node.y + radius + (8 / globalScale));
            ctx.globalAlpha = 1.0;
          }
        }}
        cooldownTicks={150}
        d3VelocityDecay={0.4}
        d3AlphaDecay={0.01}
        d3Force={(d3) => {
          d3.force('charge').strength(-150);
          d3.force('link').distance(link => {
            if (link.source.type === 'root') return 150;
            if (link.type === 'similarity') return 30;
            return 80;
          });
        }}
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
