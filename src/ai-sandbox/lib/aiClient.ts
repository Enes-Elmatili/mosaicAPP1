/**
 * Client IA (stub)
 *
 * Fournit les fonctions pour appeler l'API IA externe.
 */
/**
 * Génère du code via l'API OpenAI (chat completions).
 * Nécessite la variable d'environnement VITE_OPENAI_API_KEY.
 */
export async function generateCode(prompt: string): Promise<string> {
  console.log(`[AI Client] Generating code for prompt: ${prompt}`);
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_OPENAI_API_KEY not set');
  }
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a code generator.' }, { role: 'user', content: prompt }],
      temperature: 0.2
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${err}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content.trim() || '';
}
