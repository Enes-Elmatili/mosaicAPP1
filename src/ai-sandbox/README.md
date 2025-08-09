# AI Sandbox

Ce dossier contient la sandbox isolée pour les routines d'IA chargées de générer, modifier et protéger le code.

## Structure

- `index.ts`: point d'entrée de la sandbox
- `lib/`: bibliothèques utilitaires pour communication avec le modèle IA

# Prochaine étape
- Définir la variable d'environnement `VITE_OPENAI_API_KEY` dans `.env` pour l'accès OpenAI.
- Implémenter et tester `generateCode` dans `lib/aiClient.ts`.

## Exécution d'une tâche IA
Importez et utilisez :
```ts
import { runSandboxTask } from './index';
const result = await runSandboxTask('generateCode', { prompt: 'génère un composant React TS' });
console.log(result);
```
