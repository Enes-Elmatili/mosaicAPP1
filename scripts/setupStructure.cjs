#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

const structure = [
  { path: 'frontend/public' },
  { path: 'frontend/src/components' },
  { path: 'frontend/src/pages' },
  { path: 'frontend/src/services' },
  { path: 'frontend/src/styles' },
  {
    path: 'frontend/src/App.js',
    content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>MOSAÏC Application</h1>
    </div>
  );
}

export default App;`
  },
  {
    path: 'frontend/src/index.js',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
  },
  {
    path: 'backend/app.js',
    content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log('Server is running on port ' + PORT));`
  },
  { path: 'backend/server.js', content: `require('./app');` },
  { path: 'ai_scripts/assignment_script.py', content: `# TODO: implémenter le script d'assignation` },
  { path: 'ai_scripts/contract_generation_script.py', content: `# TODO: implémenter le script de génération de contrat` },
  { path: 'ai_scripts/predictive_analysis_script.py', content: `# TODO: implémenter le script d'analyse prédictive` },
  { path: 'database/migrations' },
  { path: 'database/seeds' },
  { path: 'database/config.js', content: `module.exports = {
  // TODO: configuration de la base de données
};` },
  { path: 'documentation/technical_documentation.md', content: `# Documentation Technique

TODO: détails techniques` },
  { path: 'documentation/functional_documentation.md', content: `# Documentation Fonctionnelle

TODO: spécifications fonctionnelles` },
  { path: 'designs/flowcharts.md', content: `# Flowcharts

TODO: diagrammes` },
  { path: 'scripts/deploy_script.sh', content: `#!/bin/bash
# TODO: script de déploiement` },
  { path: 'scripts/test_script.sh', content: `#!/bin/bash
# TODO: script de tests` },
  { path: 'README.md', content: `# MOSAÏC

Description du projet...` },
  { path: '.gitignore', content: 'node_modules/\nuploads/' }
];

async function createStructure() {
  const root = process.cwd();
  for (const entry of structure) {
    const fullPath = path.join(root, entry.path);
    if (!entry.content) {
      await fs.ensureDir(fullPath);
      console.log(`✔️ Created directory: ${entry.path}`);
    } else {
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, entry.content, 'utf8');
      console.log(`✔️ Created file: ${entry.path}`);
    }
  }
  console.log('✅ Project scaffold complete');
}

createStructure().catch(err => {
  console.error('❌ Scaffold error:', err);
  process.exit(1);
});
