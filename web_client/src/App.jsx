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
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' or 'graph'
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
    } else {
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
      {/* View Switcher Toggle */}
      <div className="absolute top-6 right-6 z-50 flex bg-charcoal border border-white/10 rounded-full p-1 shadow-2xl">
        <button
          onClick={() => setViewMode('canvas')}
          className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all ${viewMode === 'canvas' ? 'bg-white text-obsidian font-bold' : 'text-white/40 hover:text-white'}`}
        >
          Canvas
        </button>
        <button
          onClick={() => setViewMode('graph')}
          className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all ${viewMode === 'graph' ? 'bg-white text-obsidian font-bold' : 'text-white/40 hover:text-white'}`}
        >
          Mind Map
        </button>
      </div>

      {/* Floating Toggle Button for when Sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-6 left-6 z-50 p-3 text-white/50 hover:text-white transition-all flex items-center group"
          title="Open Lab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className={`transition-all duration-300 ease-in-out h-full border-r border-white/10 bg-charcoal overflow-hidden shrink-0 ${isSidebarOpen ? 'w-full md:w-96' : 'w-0'}`}>
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

      <main className="flex-1 h-full overflow-hidden relative">
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
