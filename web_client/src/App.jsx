import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PeptideCanvas from './components/PeptideCanvas';
import { fetchPeptides } from './peptideService';

function App() {
  const [peptides, setPeptides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeptide, setSelectedPeptide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="flex h-screen w-screen bg-obsidian overflow-hidden font-sans">
      <Sidebar
        peptides={filteredPeptides}
        selectedPeptideId={selectedPeptide?.id}
        onSelectPeptide={setSelectedPeptide}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <PeptideCanvas peptide={selectedPeptide} />
    </div>
  );
}

export default App;
