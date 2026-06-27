import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import PeptideCanvas from './components/PeptideCanvas';
import PeptideGraph from './components/PeptideGraph';
import PeptideDetailsPanel from './components/PeptideDetailsPanel';
import PeptideLoader from './components/PeptideLoader';
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
        setTimeout(() => setLoading(false), 1500); // Give loader some time to shine
      }
    };
    loadData();
  }, []);

  const filteredPeptides = peptides.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.sequence_one_letter && p.sequence_one_letter.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <PeptideLoader />;
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-obsidian overflow-hidden font-sans relative">

      {/* Minimalist Floating Sidebar Trigger */}
      {!isSidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={toggleSidebar}
          className="fixed top-6 left-6 z-50 p-3 bg-charcoal/80 backdrop-blur-md border border-white/10 rounded-full text-white/50 hover:text-white hover:border-white/20 transition-all shadow-2xl"
          title="Open Lab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {/* Floating View Toggle */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex bg-charcoal/80 backdrop-blur-md border border-white/10 rounded-full p-1 shadow-2xl">
        {[
          { id: 'canvas', label: 'Canvas' },
          { id: 'graph', label: 'Mind Map' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            className={`relative px-6 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ease-out ${
              viewMode === mode.id ? 'text-obsidian font-black' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="relative z-10">{mode.label}</span>
            {viewMode === mode.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Sidebar with Motion */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarOpen ? (window.innerWidth < 768 ? '100%' : '384px') : '0px' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="h-full border-r border-white/5 bg-charcoal overflow-hidden shrink-0 z-40 relative"
      >
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
      </motion.div>

      <main className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            className="h-full w-full"
          >
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
          </motion.div>
        </AnimatePresence>

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
