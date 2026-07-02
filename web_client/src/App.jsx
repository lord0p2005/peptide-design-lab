import React, { useState, useEffect, Component } from 'react';
import Sidebar from './components/Sidebar';
import PeptideCanvas from './components/PeptideCanvas';
import PeptideGraph from './components/PeptideGraph';
import PeptideDetailsPanel from './components/PeptideDetailsPanel';
import PeptideLoader from './components/PeptideLoader';
import { fetchPeptides, predictPeptideProperties, analyzePeptide } from './peptideService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-obsidian text-white p-12 text-center">
          <div>
            <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">System Error</h1>
            <p className="text-white/40 uppercase tracking-widest text-[10px] mb-8">The neural pipeline encountered an unexpected termination.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-obsidian font-bold uppercase text-[10px] tracking-widest hover:bg-white/90 transition-colors"
            >
              Reboot Pipeline
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    if (currentViewMode && currentViewMode !== viewMode) {
      setViewMode(currentViewMode);
    }

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
    const handleKeyDown = (e) => {
      // Focus search on '/'
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      // Close detail panel on 'Escape'
      if (e.key === 'Escape') {
        setIsDetailPanelOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  };

  window.addEventListener('resize', handleResize);
  // Initial check
  if (window.innerWidth < 768) setIsSidebarOpen(false);

  return () => window.removeEventListener('resize', handleResize);
}, []);

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

  const filteredPeptides = peptides.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.name?.toLowerCase().includes(search) ||
      p.id?.toLowerCase().includes(search) ||
      (p.category && p.category.toLowerCase().includes(search)) ||
      (p.sequence_one_letter && p.sequence_one_letter.toLowerCase().includes(search)) ||
      (p.sequence_three_letter && p.sequence_three_letter.join('').toLowerCase().includes(search))
    );
  });

  if (loading) {
    return <PeptideLoader />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSearch = (term) => {
    setSearchTerm(term);
    // On mobile, if we are searching and there are results, we might want to keep the sidebar open
    // but the current logic is fine.
  };

  return (
    <ErrorBoundary>
    <div className="flex h-screen w-screen bg-obsidian overflow-hidden font-sans relative">

      {/* Minimalist Floating Sidebar Trigger */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-6 left-6 z-50 p-3 glass rounded-full text-white/50 hover:text-white hover:border-white/20 transition-all shadow-2xl"
          title="Open Lab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Floating View Toggle */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex glass rounded-full p-1 shadow-2xl">
        {[
          { id: 'canvas', label: 'Canvas' },
          { id: 'graph', label: 'Mind Map' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={`relative px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all duration-200 ${
              viewMode === mode.id ? 'bg-white text-obsidian font-black' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="relative z-10">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: isSidebarOpen ? (window.innerWidth < 768 ? '100%' : '384px') : '0px',
          opacity: isSidebarOpen ? 1 : 0,
          visibility: isSidebarOpen ? 'visible' : 'hidden'
        }}
        className="h-full border-r border-white/5 bg-charcoal overflow-hidden shrink-0 z-40 relative transition-all duration-300 ease-in-out"
      >
        <div className="w-full md:w-96 h-full overflow-hidden">
          <Sidebar
            peptides={filteredPeptides}
            selectedPeptideId={selectedPeptide?.id}
            onSelectPeptide={handleSelectPeptide}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            isOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        </div>
      </div>

      <main className="flex-1 h-full overflow-hidden relative">
        <div className="h-full w-full">
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
        </div>

        <PeptideDetailsPanel
          peptide={selectedPeptide}
          analysisData={analysisData}
          loading={analysisLoading}
          isOpen={isDetailPanelOpen}
          onClose={() => setIsDetailPanelOpen(false)}
        />
      </main>
    </div>
    </ErrorBoundary>
  );
}

export default App;
