import { json } from '@sveltejs/kit';
import { createOrUpdatePage } from '$lib/api';

export async function POST({ request, locals }) {
  const currentUser = locals.user;
  const { pageId, page } = await request.json();
  await createOrUpdatePage(pageId, page, currentUser);
  return json({ pageId, status: 'ok' });
}
