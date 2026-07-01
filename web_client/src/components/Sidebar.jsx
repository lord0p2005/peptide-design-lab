import React, { useState } from 'react';

const CATEGORY_DISPLAY_NAMES = {
  "Neuro-Regenerative & Nootropic Agents": "Neuro-Modulation",
  "Tissue-Repair & Angiogenic Modulators": "Tissue Repair",
  "Metabolic & Mitochondrial Homeostasis Regulators": "Metabolic",
  "Secretagogues & Somatotropic Analogues": "Secretagogues",
  "Cosmeceutical & Epicutaneous Actives": "Cosmeceutical",
  "Experimental & Unclassified Bioactives": "Experimental"
};

const Sidebar = ({ peptides, selectedPeptideId, onSelectPeptide, searchTerm, onSearchChange, isOpen, toggleSidebar }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  // Auto-expand categories when searching
  const isSearching = searchTerm.trim().length > 0;

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Group peptides by category
  const groupedPeptides = peptides.reduce((acc, peptide) => {
    const cat = peptide.category || "Experimental & Unclassified Bioactives";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(peptide);
    return acc;
  }, {});

  const categories = Object.keys(groupedPeptides).sort((a, b) => {
    const nameA = CATEGORY_DISPLAY_NAMES[a] || a;
    const nameB = CATEGORY_DISPLAY_NAMES[b] || b;
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="h-full flex flex-col bg-charcoal border-r border-white/5">
      <div className="p-6 border-b border-white/5">
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
          <h1 className="text-xl font-bold tracking-tighter uppercase italic">
            Peptide Lab
          </h1>
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search sequences..."
            className="w-full bg-obsidian border border-white/10 rounded-none px-4 py-2.5 text-[11px] uppercase tracking-widest focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/20"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {categories.map((category) => {
          const isExpanded = expandedCategories[category] || isSearching;
          const displayCategory = CATEGORY_DISPLAY_NAMES[category] || category;
          const categoryPeptides = groupedPeptides[category];

          return (
            <div key={category} className="border-b border-white/5">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-3 p-4 bg-white/2 hover:bg-white/5 transition-colors text-left"
              >
                <div
                  className={`text-white/30 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500/80" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
                    {displayCategory}
                  </h3>
                </div>

                <span className="ml-auto text-[9px] font-mono text-white/20">
                  {categoryPeptides.length}
                </span>
              </button>

              <div className={`${isExpanded ? 'block' : 'hidden'} bg-obsidian/30`}>
                    {categoryPeptides.map((peptide) => (
                      <button
                        key={peptide.id}
                        onClick={() => onSelectPeptide(peptide)}
                        className={`w-full text-left pl-12 pr-6 py-4 border-l-2 transition-all hover:bg-white/5 group relative ${
                          selectedPeptideId === peptide.id
                            ? 'bg-white/10 border-l-white'
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-colors ${selectedPeptideId === peptide.id ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <h4 className={`text-[12px] font-bold uppercase tracking-wider transition-colors ${selectedPeptideId === peptide.id ? 'text-white' : 'text-white/60'}`}>
                              {peptide.name}
                            </h4>
                            <p className="text-[9px] uppercase tracking-widest text-white/30 mt-0.5">
                              {peptide.sequence_one_letter.length} Residues
                            </p>
                          </div>
                        </div>

                        {selectedPeptideId === peptide.id && (
                          <div
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white"
                          />
                        )}
                      </button>
                    ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
