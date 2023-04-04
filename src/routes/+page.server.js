import { getArticles, getPage } from '$lib/api';

export async function load({ locals }) {
  const currentUser = locals.user;
  const articles = await getArticles();
  const page = await getPage('home');

  return {
    currentUser,
    articles: articles.slice(0, 3),
    page
  };
}
