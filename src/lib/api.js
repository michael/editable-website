import slugify from 'slugify';
import _db from './_db';
import { SHORTCUTS } from './constants';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

/** Use a singleton DB instance */
const db = _db.instance;

/**
 * Creates a new draft
 */
export async function createArticle(title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  const slug = slugify(title, {
    lower: true,
    strict: true
  });

  return await db.tx('create-article', async t => {
    let newArticle = await t.one(
      'INSERT INTO articles (slug, title, content, teaser, published_at) values($1, $2, $3, $4, NOW()) RETURNING slug, created_at',
      [slug, title, content, teaser]
    );
    return newArticle;
  });
}

/**
 * We automatically extract a teaser text from the document's content.
 */
export async function updateArticle(slug, title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  return await db.tx('update-article', async t => {
    return await t.one(
      'UPDATE articles SET title= $1, content = $2, teaser = $3, updated_at = NOW() WHERE slug = $4 RETURNING slug, updated_at',
      [title, content, teaser, slug]
    );
  });
}

/*
  This can be replaced with any user-based authentication system
*/
export async function authenticate(password, sessionTimeout) {
  return await db.tx('create-session', async t => {
    const expires = __getDateTimeMinutesAfter(sessionTimeout);
    if (password === ADMIN_PASSWORD) {
      const { sessionId } = await t.one(
        'INSERT INTO sessions (expires) values($1) returning session_id',
        [expires]
      );
      return { sessionId };
    } else {
      throw 'Authentication failed.';
    }
  });
}

/*
  Log out of the admin session ...
*/
export async function destroySession(sessionId) {
  return await db.tx('destroy-session', async t => {
    await t.any('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
    return true;
  });
}

/**
 * List all available articles (newest first)
 */
export async function getArticles(currentUser) {
  return await db.tx('get-articles', async t => {
    let articles;
    if (currentUser) {
      // When logged in show both, drafts and published articles
      articles = await t.any(
        'SELECT *, COALESCE(published_at, updated_at, created_at) AS modified_at FROM articles ORDER BY modified_at DESC'
      );
    } else {
      articles = await t.any(
        'SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC'
      );
    }
    return articles;
  });
}

/**
 * Given a slug, determine article to "read next"
 */
export async function getNextArticle(slug) {
  return db.tx('get-next-article', async t => {
    return t.oneOrNone(
      `
      (
        SELECT
          title,
          teaser,
          slug,
          published_at
        FROM articles
        WHERE
          published_at < (SELECT published_at FROM articles WHERE slug= $1)
        ORDER BY published_at DESC
        LIMIT 1
      )
      UNION
      (
        SELECT title, teaser, slug, published_at FROM articles ORDER BY published_at DESC LIMIT 1
      )
      ORDER BY published_at ASC
      LIMIT 1;
    `,
      [slug]
    );
  });
}

/**
 * Search within all searchable items (including articles and website sections)
 */
export async function search(q, currentUser) {
  return await db.tx('search', async t => {
    let result;
    if (currentUser) {
      result = await t.any(
        "SELECT title AS name, CONCAT('/blog/', slug) AS url, COALESCE(published_at, updated_at, created_at) AS modified_at FROM articles WHERE title ILIKE $1 ORDER BY modified_at DESC",
        [`%${q}%`]
      );
    } else {
      result = await t.any(
        "SELECT title AS name, CONCAT('/blog/', slug) AS url, COALESCE(published_at, updated_at, created_at) AS modified_at FROM articles WHERE title ILIKE $1 AND published_at IS NOT NULL ORDER BY modified_at DESC",
        [`%${q}%`]
      );
    }

    // Also include prefined shortcuts in search
    SHORTCUTS.forEach(shortcut => {
      if (shortcut.name.toLowerCase().includes(q.toLowerCase())) {
        result.push(shortcut);
      }
    });

    return result;
  });
}

/**
 * Retrieve article based on a given slug
 */
export async function getArticleBySlug(slug) {
  return await db.tx('get-article-by-slug', async t => {
    const article = await t.one('SELECT * FROM articles WHERE slug = $1', [slug]);
    return article;
  });
}

/**
 * Remove the entire article
 */
export async function deleteArticle(slug, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  return await db.tx('delete-article', async t => {
    await t.any('DELETE FROM articles WHERE slug = $1', [slug]);
    return true;
  });
}

/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
export async function getCurrentUser(sessionId) {
  return await db.tx('get-current-user', async t => {
    const session = await t.oneOrNone('SELECT session_id FROM sessions WHERE session_id = $1', [
      sessionId
    ]);
    if (session) {
      return {
        name: 'Admin'
      };
    } else {
      return null;
    }
  });
}

/**
 * Update the page
 */
export async function createOrUpdatePage(pageId, page, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  return await db.tx('create-or-update-page', async t => {
    const pageExists = await t.oneOrNone('SELECT page_id FROM pages WHERE page_id = $1', [pageId]);
    if (pageExists) {
      return await t.one('UPDATE pages SET data = $1 WHERE page_id = $2 RETURNING page_id', [
        page,
        pageId
      ]);
    } else {
      return await t.one('INSERT INTO pages (page_id, data) values($1, $2) RETURNING page_id', [
        pageId,
        page
      ]);
    }
  });
}

/**
 * E.g. getPage("home") gets all dynamic data for the home page
 */
export async function getPage(pageId) {
  return await db.tx('get-page', async t => {
    const page = await t.oneOrNone('SELECT data FROM pages WHERE page_id = $1', [pageId]);
    return page?.data;
  });
}

/**
 * TODO: Turn this into a Postgres function
 */
export async function createOrUpdateCounter(counterId) {
  return await db.tx('create-or-update-counter', async t => {
    const counterExists = await t.oneOrNone(
      'SELECT counter_id FROM counters WHERE counter_id = $1',
      [counterId]
    );
    if (counterExists) {
      return await t.one(
        'UPDATE counters SET count = count + 1 WHERE counter_id = $1 RETURNING count',
        [counterId]
      );
    } else {
      return await t.one('INSERT INTO counters (counter_id, count) values($1, 1) RETURNING count', [
        counterId
      ]);
    }
  });
}

/**
 * Helpers
 */
function __getDateTimeMinutesAfter(minutes) {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
}
