CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- articles
DROP TABLE IF EXISTS articles cascade;
CREATE TABLE articles (
  article_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(100) UNIQUE NOT NULL,
  title varchar(100) NOT NULL,
  teaser varchar(1000) NOT NULL,
  content text,
  created_at timestamptz DEFAULT NOW()::timestamptz,
  published_at timestamptz NULL,
  updated_at timestamptz NULL
);

-- sessions
DROP TABLE IF EXISTS sessions cascade;
CREATE TABLE sessions (
  session_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expires timestamptz NOT NULL
);

-- pages
DROP TABLE IF EXISTS pages cascade;
CREATE TABLE pages (
	page_id varchar(100) PRIMARY KEY,
	data json NOT NULL
);

-- counters (for view counts and everything you want to track anonymously)
DROP TABLE IF EXISTS counters cascade;
CREATE TABLE counters (
	counter_id varchar(100) PRIMARY KEY,
	count integer NOT NULL
);
