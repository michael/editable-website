import { getArticleBySlug, getNextArticle } from '$lib/api';

export async function load({ params, locals }) {
  const currentUser = locals.user;
  const data = await getArticleBySlug(params.slug);
  const articles = [await getNextArticle(params.slug)];
  return {
    ...data,
    currentUser,
    articles
  };
}
