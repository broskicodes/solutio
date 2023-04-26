import { Database, OPEN_READONLY, OPEN_READWRITE } from 'sqlite3';
import path from 'path';
import "dotenv/config";
import { NextApiRequest, NextApiResponse } from 'next';
import { handleError } from './error';
import { generateApiKey } from './api';

const initDb = () => {
  const db = getDbConnection(OPEN_READWRITE);

  db?.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      pubkey VARCHAR(50) PRIMARY KEY
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS hosts (
      user VARCHAR(50),
      host TINYTEXT,
      PRIMARY KEY (user, host),
      FOREIGN KEY (user) REFERENCES users(pubkey)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS api_keys (
      key CHAR(50) PRIMARY KEY,
      user VARCHAR(50),
      host TINYTEXT,
      FOREIGN KEY (user, host) REFERENCES hosts(user, host)
    )`)
  })
}

export const getDbConnection = (mode: number, res?: NextApiResponse) => {
  if (!process.env.DATABASE_FILE) {
    if (res) {
      handleError(res, "Server failed to load database");
      return;
    } else {
     throw new Error("No database file provided");
    }
  }

  // console.log(path.join(__dirname, '..', '..', '..', process.env.DATABASE_FILE));

  return new Database(path.join(__dirname, '..', '..', '..', '..', process.env.DATABASE_FILE), mode)
}

export const addNewApiKeyRecord = (req: NextApiRequest, res: NextApiResponse) => {
  const { pubkey, host } = req.body;

  if (!pubkey || !host) {
    handleError(res, "Request body is missing a required field");
    return;
  }

  const db = getDbConnection(OPEN_READWRITE, res);
  if (!db) {
    handleError(res, "Could not load database");
    return;
  }

  const apiKey = generateApiKey();

  db.serialize(() => {
    const userStmt = db.prepare('INSERT INTO users (pubkey) VALUES (?)');
    userStmt.run(pubkey);
    userStmt.finalize();

    const hostStmt = db.prepare("INSERT INTO hosts (user, host) VALUES (?, ?)");
    hostStmt.run(pubkey, host);
    hostStmt.finalize();
      
    const apiStmt = db.prepare("INSERT INTO api_keys (key, user, host) VALUES (?, ?, ?)");
    apiStmt.run(apiKey, pubkey, host);
    apiStmt.finalize();
  });

  db.close();

  return apiKey;
}

export const findApiKeyEntry = (key: string, res: NextApiResponse) => {
  const db = getDbConnection(OPEN_READONLY);
  if (!db) {
    handleError(res, "Could not load database");
    return;
  }

  db.get(`
    SELECT key, host FROM api_keys
    
  `, (err, row) => {
    console.log(row)
  });

  db.close()
}