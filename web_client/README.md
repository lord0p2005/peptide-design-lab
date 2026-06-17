# Trending Peptide Design Lab Dashboard

A high-contrast, editorial web dashboard for visualizing peptide chains and their back-translated genetic blueprints.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Typography**: Inter (Sans), JetBrains Mono (Mono)

## Features

- **Searchable Peptide Feed**: Explore peptides by name, market trend, clinical use, and side effects.
- **Sequence Visualization**: Horizontal "string of beads" representation of amino acid sequences.
- **Genetic Mapping**: Synchronized alignment of mRNA, Coding DNA, and Template DNA block-by-block with the amino acids.
- **Editorial Aesthetic**: Obsidian and charcoal dark theme for a sophisticated laboratory feel.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

Navigate to the `web_client/` directory and install dependencies:

```bash
cd web_client
npm install
```

### Development Server

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port specified in your terminal).

### Production Build

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

## Data Integration

The dashboard reads biological data from `core_engine/enriched_peptides.json` via a symlink located at `src/data/peptides.json`. This ensures that any updates to the core engine's data are immediately reflected in the dashboard.
