export default {
	up({ db }) {
		const now = new Date().toISOString();

		db.exec(`
			ALTER TABLE documents ADD COLUMN created_at TEXT;
			ALTER TABLE documents ADD COLUMN updated_at TEXT;
		`);

		db.prepare(
			`
				UPDATE documents
				SET created_at = COALESCE(created_at, ?),
					updated_at = COALESCE(updated_at, ?)
			`
		).run(now, now);
	}
};
