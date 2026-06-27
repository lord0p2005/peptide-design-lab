import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PeptideCanvas from './components/PeptideCanvas';
import PeptideGraph from './components/PeptideGraph';
import PeptideDetailsPanel from './components/PeptideDetailsPanel';
import { fetchPeptides, predictPeptideProperties, analyzePeptide } from './peptideService';

function App() {
  const [peptides, setPeptides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas', 'graph', or 'wiki'
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const handleSelectPeptide = async (peptide, currentViewMode) => {
    setSelectedPeptide(peptide);

    const mode = currentViewMode || viewMode;

    if (mode === 'canvas') {
      setAiData(null);
      setAiLoading(true);
      const prediction = await predictPeptideProperties(peptide.sequence_one_letter);
      if (prediction) {
        setAiData(prediction.properties);
      }
      setAiLoading(false);
    } else if (mode === 'graph') {
      setIsDetailPanelOpen(true);
      setAnalysisData(null);
      setAnalysisLoading(true);
      const analysis = await analyzePeptide(peptide.sequence_one_letter);
      if (analysis) {
        setAnalysisData(analysis);
      }
      setAnalysisLoading(false);
    }

    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPeptides();
        setPeptides(data);
        if (data.length > 0) {
          handleSelectPeptide(data[0], viewMode);
        }
      } catch (error) {
        console.error("Failed to fetch peptides:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPeptides = peptides.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen w-screen bg-obsidian flex items-center justify-center">
        <div className="text-white text-xs uppercase tracking-[0.5em] animate-pulse">Initializing Lab...</div>
      </div>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-obsidian overflow-hidden font-sans relative">
      {/* Elite Top Toggle Ribbon */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-3 border-b border-white/5 bg-obsidian/80 backdrop-blur-xl">
        <div className="flex items-center gap-6">
           {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-white/50 hover:text-white transition-all"
              title="Open Lab"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
            <div className="h-4 w-px bg-white/10 mx-2 hidden md:block"></div>
            <h1 className="text-sm tracking-[0.4em] font-black text-white uppercase hidden sm:block">
              Peptide Design Lab
            </h1>
          </div>
        </div>

        <div className="flex bg-neutral-950 border border-white/5 rounded-full p-1 shadow-inner">
          {[
            { id: 'canvas', label: '01. Canvas' },
            { id: 'graph', label: '02. Mind Map' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-6 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] transition-all duration-500 ease-out ${
                viewMode === mode.id
                  ? 'bg-white text-obsidian font-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="hidden md:block w-32" /> {/* Spacer for symmetry */}
      </header>

      <div className={`transition-all duration-300 ease-in-out h-full border-r border-white/10 bg-charcoal overflow-hidden shrink-0 pt-16 ${isSidebarOpen ? 'w-full md:w-96' : 'w-0'}`}>
        <div className="w-full md:w-96 h-full">
          <Sidebar
            peptides={filteredPeptides}
            selectedPeptideId={selectedPeptide?.id}
            onSelectPeptide={handleSelectPeptide}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>

      <main className="flex-1 h-full overflow-hidden relative pt-16">
        {viewMode === 'canvas' ? (
          <PeptideCanvas
            peptide={selectedPeptide}
            aiData={aiData}
            aiLoading={aiLoading}
          />
        ) : (
          <PeptideGraph
            peptides={peptides}
            onSelectPeptide={handleSelectPeptide}
          />
        )}

        <PeptideDetailsPanel
          peptide={selectedPeptide}
          analysisData={analysisData}
          loading={analysisLoading}
          isOpen={isDetailPanelOpen}
          onClose={() => setIsDetailPanelOpen(false)}
        />
      </main>
    </div>
  );
}

export default App;
