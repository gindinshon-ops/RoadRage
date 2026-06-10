declare var initSqlJs: any;

let db: any = null;

export async function getDB() {
    if (db) return db;

    // Check if initSqlJs is actually available on the window scope
    const initializer = typeof initSqlJs !== 'undefined' ? initSqlJs : (window as any).initSqlJs;

    if (!initializer) {
        throw new Error("sql.js library has not loaded yet. Make sure your script tags are in order!");
    }

    const SQL = await initializer({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    const savedDb = localStorage.getItem("sqlite_game_db");

    if (savedDb) {
        try {
            const uints = new Uint8Array(JSON.parse(savedDb));
            db = new SQL.Database(uints);
        } catch (e) {
            console.error("Corrupted local database found. Resetting...", e);
            db = new SQL.Database();
            createTables();
        }
    } else {
        db = new SQL.Database();
        createTables();
    }
    return db;
}

function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        );
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            score INTEGER
        );
    `);
    saveDB();
}

// Turned this into an async-compatible signature so your auth file doesn't crash
export async function saveDB() {
    if (!db) return;
    const binaryArray = db.export();
    localStorage.setItem("sqlite_game_db", JSON.stringify(Array.from(binaryArray)));
}