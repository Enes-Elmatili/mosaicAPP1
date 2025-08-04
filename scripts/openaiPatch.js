#!/usr/bin/env node
import fs from 'fs';
import process from 'process';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

const [,, filePath, ...promptParts] = process.argv;

if (!filePath || promptParts.length === 0) {
  console.error('Usage: node scripts/openaiPatch.js <filePath> <prompt>');
  process.exit(1);
}

const prompt = promptParts.join(' ');
const fileContent = fs.readFileSync(filePath, 'utf8');

const body = {
  model: 'gpt-4.1-mini',
  input: [
    { role: 'system', content: 'You are a helpful code assistant.' },
    {
      role: 'user',
      content: `Here is the current content of ${filePath}:
${fileContent}
\nPlease apply the following patch instruction and return the full updated file content:
${prompt}`
    }
  ]
};

const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

if (!response.ok) {
  console.error('OpenAI API error:', await response.text());
  process.exit(1);
}

const data = await response.json();
const newContent = data.output_text || data.choices?.[0]?.message?.content;

if (!newContent) {
  console.error('No content returned from OpenAI.');
  process.exit(1);
}

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('File patched successfully.');

