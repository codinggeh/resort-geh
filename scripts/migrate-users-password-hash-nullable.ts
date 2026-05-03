import Database from 'better-sqlite3';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

type TableInfoRow = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
};

const tableInfo = db.prepare("PRAGMA table_info('users')").all() as TableInfoRow[];
const passwordHashColumn = tableInfo.find((column) => column.name === 'password_hash');

if (!passwordHashColumn) {
  throw new Error("users.password_hash column not found");
}

if (passwordHashColumn.notnull === 0) {
  console.log('users.password_hash is already nullable');
  process.exit(0);
}

const migrate = db.transaction(() => {
  db.pragma('foreign_keys = OFF');
  db.exec(`
    CREATE TABLE users__new (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      email text NOT NULL,
      password_hash text,
      role text DEFAULT 'GUEST' NOT NULL,
      avatar_url text,
      created_at integer NOT NULL,
      email_verified integer DEFAULT false NOT NULL,
      updated_at integer NOT NULL
    );
  `);

  db.exec(`
    INSERT INTO users__new (
      id,
      name,
      email,
      password_hash,
      role,
      avatar_url,
      created_at,
      email_verified,
      updated_at
    )
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      avatar_url,
      created_at,
      email_verified,
      updated_at
    FROM users;
  `);

  db.exec('DROP TABLE users;');
  db.exec('ALTER TABLE users__new RENAME TO users;');
  db.exec('CREATE UNIQUE INDEX users_email_unique ON users (email);');
  db.pragma('foreign_keys = ON');
});

migrate();
console.log('users.password_hash is now nullable');
