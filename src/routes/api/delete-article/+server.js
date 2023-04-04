import { json } from '@sveltejs/kit';
import { deleteArticle } from '$lib/api';

export async function POST({ request, locals }) {
  const user = locals.user;
  const { slug } = await request.json();
  const result = await deleteArticle(slug, user);
  return json(result);
}
