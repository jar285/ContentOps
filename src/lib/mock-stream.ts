export async function* mockStreamGenerator(
  prompt: string,
): AsyncGenerator<string, void, unknown> {
  const trimmed = prompt.trim().toLowerCase();

  // Deterministic delay simulating latency
  await new Promise((r) => setTimeout(r, 20));

  if (trimmed === 'throw error') {
    throw new Error('Simulated streaming error triggered by prompt.');
  }

  const responseText =
    'I can help onboard Side Quest Syndicate by clarifying the brand voice, identifying content pillars, drafting first-week post ideas, and preparing items for editorial approval.';
  const chunks = responseText.split(' ');

  for (let i = 0; i < chunks.length; i++) {
    // Deterministic chunk timeout
    await new Promise((r) => setTimeout(r, 10));
    yield chunks[i] + (i === chunks.length - 1 ? '' : ' ');
  }
}
