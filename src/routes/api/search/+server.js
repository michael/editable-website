import { search } from '$lib/api';
import { json } from '@sveltejs/kit';

export async function GET({ url, locals }) {
  const currentUser = locals.user;
  const searchQuery = url.searchParams.get('q') || '';
  return json(await search(searchQuery, currentUser));
}
