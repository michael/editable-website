import { json } from '@sveltejs/kit';
import { askGPT } from '$lib/util.js';

export async function POST({ request, locals }) {
  const user = locals.user;
  if (!user) throw new Error('Not authorized');
  const { prompt, existingText } = await request.json();
  const completion = await askGPT(prompt, existingText);
  return json(completion);
}
