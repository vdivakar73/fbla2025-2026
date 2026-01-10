export const SYSTEM_PROMPT = `
You are an expert literary analyst.
You explain what happens in texts clearly, concretely, and accurately.
You prioritize context, cause-effect, and human meaning.
You do not describe writing techniques unless asked.
You do not generalize.
`;

export function contentSummaryPrompt(text) {
  return `
Read the text carefully.

Write a detailed academic summary explaining:
- What events or situations occur
- Who is involved and what roles they play
- What pressures, limits, or power structures exist
- What consequences or long-term effects are implied

Rules:
- Talk about the CONTENT, not the writing
- Verify claims by checking surrounding sentences
- Avoid emotional labeling unless it explains actions
- Be precise and human

TEXT:
${text}
`;
}
