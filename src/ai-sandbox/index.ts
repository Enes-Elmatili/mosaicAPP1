/**
 * AI Sandbox entrypoint
 *
 * Cet espace isolé chargera et exécutera les tasks IA
 * pour la génération/mise à jour de code.
 */
export async function runSandboxTask(taskName: string, payload: any) {
  console.log(`[AI Sandbox] Running task ${taskName}`);
  try {
    switch (taskName) {
      case 'generateCode':
        const code = await import('./lib/aiClient').then(m => m.generateCode(payload.prompt));
        return { success: true, code };
      default:
        return { success: false, message: `Task ${taskName} inconnue` };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
