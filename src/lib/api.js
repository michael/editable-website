import slugify from 'slugify';
import { SHORTCUTS } from './constants';
import Database from 'better-sqlite3';
import { nanoid } from '$lib/util';
import { DB_PATH, ADMIN_PASSWORD } from '$env/static/private';
import { Blob } from 'node:buffer';

const db = new Database(DB_PATH, {
  // verbose: console.log
});
db.pragma('journal_mode = WAL');
db.pragma('case_sensitive_like = true');


/**
 * Creates a new article
 */
export async function createArticle(title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

    let slug = slugify(title, {
      lower: true,
      strict: true
    });

    // If slug is already used, we add a unique postfix
    const articleExists = db.prepare('SELECT * FROM articles WHERE slug = ?').get(slug);
    if (articleExists) {
      slug = slug + '-' + nanoid();
    }

    db.prepare(`
        INSERT INTO articles (slug, title, content, teaser, published_at)
        VALUES(?, ?, ?, ?, DATETIME('now'))
      `)
      .run(
        slug,
        title,
        content,
        teaser
      );

  const newArticleQuery = "SELECT slug, created_at FROM articles WHERE slug = ?";
  const newArticle = db.prepare(newArticleQuery).get(slug);
  return newArticle;
}

/**
 * We automatically extract a teaser text from the document's content.
 */
export async function updateArticle(slug, title, content, teaser, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  const query = `
    UPDATE articles
    SET title = ?, content = ?, teaser = ?, updated_at = datetime('now')
    WHERE slug = ?
  `;
  const updateStmt = db.prepare(query);
  updateStmt.run(title, content, teaser, slug);

  const updatedArticleQuery = "SELECT slug, updated_at FROM articles WHERE slug = ?";
  const updatedArticle = db.prepare(updatedArticleQuery).get(slug);

  return updatedArticle;
}

/*
  This can be replaced with any user-based authentication system
*/
export async function authenticate(password, sessionTimeout) {
  const expires = __getDateTimeMinutesAfter(sessionTimeout);
  if (password === ADMIN_PASSWORD) {
    const sessionId = nanoid();

    // Now is a good time to remove expired sessions
    db.prepare('DELETE FROM sessions WHERE expires < ?').run(new Date().toISOString());

    // Create a new session
    db.prepare('INSERT INTO sessions (session_id, expires) values(?, ?) returning session_id').run(
      sessionId,
      expires
    );

    return { sessionId };
  } else {
    throw 'Authentication failed.';
  }
}

/*
  Log out of the admin session ...
*/
export async function destroySession(sessionId) {
  db.prepare('DELETE FROM sessions WHERE session_id = ?').run(sessionId);
  return true;
}

/**
 * List all available articles (newest first)
 */
export async function getArticles(currentUser) {
  let articles;
  let statement;

  if (currentUser) {
    // When logged in, show both drafts and published articles
    statement = db.prepare(
      'SELECT *, COALESCE(published_at, updated_at, created_at) AS modified_at FROM articles ORDER BY modified_at DESC'
    );
  } else {
    statement = db.prepare(
      'SELECT * FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC'
    );
  }

  articles = statement.all();
  return articles;
}

/**
 * Given a slug, determine article to "read next"
 */
export async function getNextArticle(slug) {
  const query = `
    WITH previous_published AS (
      SELECT
        title,
        teaser,
        slug,
        published_at
      FROM articles
      WHERE
        published_at < (SELECT published_at FROM articles WHERE slug = ?)
      ORDER BY published_at DESC
      LIMIT 1
    ),
    latest_article AS (
      SELECT
        title,
        teaser,
        slug,
        published_at
      FROM articles
      WHERE slug <> ?
      ORDER BY published_at DESC
      LIMIT 1
    )
    SELECT title, teaser, slug, published_at
    FROM (
      SELECT * FROM previous_published
      UNION
      SELECT * FROM latest_article
    )
    ORDER BY published_at ASC
    LIMIT 1;
  `;

  const result = db.prepare(query).get(slug, slug);
  return result;
}

/**
 * Search within all searchable items (including articles and website sections)
 */
export async function search(q, currentUser) {
  let query;
  if (currentUser) {
    query = `
      SELECT title AS name, '/blog/' || slug AS url, COALESCE(published_at, updated_at, created_at) AS modified_at
      FROM articles
      WHERE title LIKE ? COLLATE NOCASE
      ORDER BY modified_at DESC;
    `;
  } else {
    query = `
      SELECT title AS name, '/blog/' || slug AS url, COALESCE(published_at, updated_at, created_at) AS modified_at
      FROM articles
      WHERE title LIKE ? COLLATE NOCASE AND published_at IS NOT NULL
      ORDER BY modified_at DESC;
    `;
  }

  const results = db.prepare(query).all(`%${q}%`);

  // Also include predefined shortcuts in search
  SHORTCUTS.forEach(shortcut => {
    if (shortcut.name.toLowerCase().includes(q.toLowerCase())) {
      results.push(shortcut);
    }
  });

  return results;
}

/**
 * Retrieve article based on a given slug
 */
export async function getArticleBySlug(slug) {
  const query = "SELECT * FROM articles WHERE slug = ?";
  const article = db.prepare(query).get(slug);
  return article;
}

/**
 * Remove the entire article
 */
export async function deleteArticle(slug, currentUser) {
  if (!currentUser) throw new Error('Not authorized');

  const query = "DELETE FROM articles WHERE slug = ?";
  const result = db.prepare(query).run(slug);

  return result.changes > 0;
}

/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
/**
 * In this minimal setup there is only one user, the website admin.
 * If you want to support multiple users/authors you want to return the current user record here.
 */
export async function getCurrentUser(session_id) {
  const stmt = db.prepare(
    'SELECT session_id, expires FROM sessions WHERE session_id = ? AND expires > ?'
  );
  const session = stmt.get(session_id, new Date().toISOString());

  if (session) {
    return { name: 'Admin' };
  } else {
    return null;
  }
}


/**
 * Update the page
 */
export async function createOrUpdatePage(page_id, page, currentUser) {
  if (!currentUser) throw new Error('Not authorized');
  const pageExists = db.prepare('SELECT page_id FROM pages WHERE page_id = ?').get(page_id);
  if (pageExists) {
    return db
      .prepare('UPDATE pages SET data = ?, updated_at = ? WHERE page_id = ? RETURNING page_id')
      .get(JSON.stringify(page), new Date().toISOString(), page_id);
  } else {
    return db
      .prepare('INSERT INTO pages (page_id, data, updated_at) values(?, ?, ?) RETURNING page_id')
      .get(page_id, JSON.stringify(page), new Date().toISOString());
  }
}

/**
 * E.g. getPage("home") gets all dynamic data for the home page
 */
export async function getPage(page_id) {
  const page = db.prepare('SELECT data FROM pages WHERE page_id = ?').get(page_id);
  if (page?.data) {
    return JSON.parse(page.data);
  } else {
    return null;
  }
}

/**
 * We can count all kinds of things with this.
 */
export async function createOrUpdateCounter(counter_id) {
  return db.transaction(() => {
    // Remove recipients associated with the friend if there are any entries
    const counter_exists = db
      .prepare('SELECT counter_id FROM counters WHERE counter_id = ?')
      .get(counter_id);
    if (counter_exists) {
      return db
        .prepare('UPDATE counters SET count = count + 1 WHERE counter_id = ? RETURNING count')
        .get(counter_id);
    } else {
      return db
        .prepare('INSERT INTO counters (counter_id, count) values(?, 1) RETURNING count')
        .get(counter_id);
    }
  })();
}

// asset_id is a string and has the form path
export async function storeAsset(asset_id, file) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const sql = `
  INSERT into assets (asset_id, mime_type, updated_at, size, data) VALUES (?, ?, ?, ?, ?)
  ON CONFLICT (asset_id) DO
  UPDATE
     SET mime_type = excluded.mime_type,
         updated_at = excluded.updated_at,
         size = excluded.size,
         data = excluded.data
  WHERE asset_id = excluded.asset_id
  `;
  const stmnt = db.prepare(sql);
  stmnt.run(asset_id, file.type, new Date().toISOString(), file.size, buffer);
}

export function getAsset(asset_id) {
  const sql = `
  SELECT
    asset_id,
    mime_type,
    updated_at,
    size,
    data
  FROM assets
  WHERE asset_id = ?
  `;

  const stmnt = db.prepare(sql);
  const row = stmnt.get(asset_id);
  return {
    filename: row.asset_id.split('/').slice(-1),
    mimeType: row.mime_type,
    lastModified: row.updated_at,
    size: row.size,
    data: new Blob([row.data], { type: row.mime_type })
  };
}

/**
 * Helpers
 */
function __getDateTimeMinutesAfter(minutes) {
  return new Date(new Date().getTime() + minutes * 60000).toISOString();
}
