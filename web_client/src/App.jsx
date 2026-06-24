import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PeptideCanvas from './components/PeptideCanvas';
import { fetchPeptides, predictPeptideProperties } from './peptideService';

function App() {
  const [peptides, setPeptides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPeptides();
        setPeptides(data);
        if (data.length > 0) {
          handleSelectPeptide(data[0]);
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

  const handleSelectPeptide = async (peptide) => {
    setSelectedPeptide(peptide);
    setAiData(null);
    setAiLoading(true);

    // Fetch live AI predictions
    const prediction = await predictPeptideProperties(peptide.sequence_one_letter);
    if (prediction) {
      setAiData(prediction.properties);
    }
    setAiLoading(false);

    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-obsidian overflow-hidden font-sans relative">
      {/* Floating Toggle Button for when Sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute top-6 left-6 z-50 p-3 bg-charcoal border border-white/10 text-white hover:bg-white/10 transition-all rounded-sm flex items-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Open Lab</span>
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

      <main className="flex-1 h-full overflow-hidden">
        <PeptideCanvas
          peptide={selectedPeptide}
          aiData={aiData}
          aiLoading={aiLoading}
        />
      </main>
    </div>
  );
}

export default App;
