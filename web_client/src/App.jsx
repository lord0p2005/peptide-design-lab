import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PeptideCanvas from './components/PeptideCanvas';
import { fetchPeptides } from './peptideService';

function App() {
  const [peptides, setPeptides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPeptides();
        setPeptides(data);
        if (data.length > 0) {
          setSelectedPeptide(data[0]);
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

  const handleSelectPeptide = (peptide) => {
    setSelectedPeptide(peptide);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-obsidian overflow-hidden font-sans relative">
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 right-6 z-50 md:hidden bg-white text-obsidian p-4 rounded-full shadow-2xl font-black uppercase text-[10px] tracking-widest"
      >
        {isSidebarOpen ? 'Close' : 'Menu'}
      </button>

      <Sidebar
        peptides={filteredPeptides}
        selectedPeptideId={selectedPeptide?.id}
        onSelectPeptide={handleSelectPeptide}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isOpen={isSidebarOpen}
      />

      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
        <PeptideCanvas peptide={selectedPeptide} />
      </main>
    </div>
  );
}

export default App;
