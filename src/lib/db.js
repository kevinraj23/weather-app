import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve(process.cwd(), 'database.sqlite');
let db = null;

/**
 * Initialize the SQLite database and create tables if they don't exist
 * @returns {Database} The database instance
 */
export function initDB() {
  if (db) return db;
  
  db = new Database(dbPath);
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Create weather_records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS weather_records (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      location_name TEXT NOT NULL,
      latitude      REAL NOT NULL,
      longitude     REAL NOT NULL,
      date_from     TEXT NOT NULL,
      date_to       TEXT NOT NULL,
      temp_min      REAL,
      temp_max      REAL,
      temp_avg      REAL,
      weather_code  INTEGER,
      weather_desc  TEXT,
      humidity      REAL,
      wind_speed    REAL,
      precipitation REAL,
      raw_data      TEXT,
      created_at    TEXT DEFAULT (datetime('now')),
      updated_at    TEXT DEFAULT (datetime('now'))
    );
  `);
  
  // Create index for search performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_location_name ON weather_records(location_name);
    CREATE INDEX IF NOT EXISTS idx_created_at ON weather_records(created_at DESC);
  `);
  
  return db;
}

/**
 * Get the database instance, initializing if needed
 * @returns {Database}
 */
function getDB() {
  if (!db) {
    return initDB();
  }
  return db;
}

/**
 * Create a new weather record
 * @param {Object} record - The record data
 * @returns {Object} The created record with ID
 */
export function createRecord(record) {
  const database = getDB();
  const stmt = database.prepare(`
    INSERT INTO weather_records (
      location_name, latitude, longitude, date_from, date_to,
      temp_min, temp_max, temp_avg, weather_code, weather_desc,
      humidity, wind_speed, precipitation, raw_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    record.location_name,
    record.latitude,
    record.longitude,
    record.date_from,
    record.date_to,
    record.temp_min ?? null,
    record.temp_max ?? null,
    record.temp_avg ?? null,
    record.weather_code ?? null,
    record.weather_desc ?? null,
    record.humidity ?? null,
    record.wind_speed ?? null,
    record.precipitation ?? null,
    record.raw_data ? JSON.stringify(record.raw_data) : null
  );
  
  return getRecord(result.lastInsertRowid);
}

/**
 * Get all weather records with optional search filter
 * @param {Object} options - Query options
 * @param {string} [options.search] - Search term for location name
 * @param {number} [options.limit] - Maximum records to return
 * @param {number} [options.offset] - Offset for pagination
 * @returns {Array} Array of records
 */
export function getRecords({ search = '', limit = 100, offset = 0 } = {}) {
  const database = getDB();
  
  let query = 'SELECT * FROM weather_records';
  const params = [];
  
  if (search) {
    query += ' WHERE location_name LIKE ?';
    params.push(`%${search}%`);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const stmt = database.prepare(query);
  const rows = stmt.all(...params);
  
  return rows.map(row => ({
    ...row,
    raw_data: row.raw_data ? JSON.parse(row.raw_data) : null
  }));
}

/**
 * Get a single weather record by ID
 * @param {number} id - Record ID
 * @returns {Object|null} The record or null if not found
 */
export function getRecord(id) {
  const database = getDB();
  const stmt = database.prepare('SELECT * FROM weather_records WHERE id = ?');
  const row = stmt.get(id);
  
  if (!row) return null;
  
  return {
    ...row,
    raw_data: row.raw_data ? JSON.parse(row.raw_data) : null
  };
}

/**
 * Update a weather record
 * @param {number} id - Record ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} The updated record or null if not found
 */
export function updateRecord(id, updates) {
  const database = getDB();
  
  // Check if record exists
  const existing = getRecord(id);
  if (!existing) return null;
  
  // Build dynamic update query
  const allowedFields = [
    'location_name', 'latitude', 'longitude', 'date_from', 'date_to',
    'temp_min', 'temp_max', 'temp_avg', 'weather_code', 'weather_desc',
    'humidity', 'wind_speed', 'precipitation', 'raw_data'
  ];
  
  const setClauses = [];
  const params = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      setClauses.push(`${key} = ?`);
      params.push(key === 'raw_data' && value ? JSON.stringify(value) : value);
    }
  }
  
  if (setClauses.length === 0) return existing;
  
  // Always update updated_at
  setClauses.push('updated_at = datetime(\'now\')');
  
  const query = `UPDATE weather_records SET ${setClauses.join(', ')} WHERE id = ?`;
  params.push(id);
  
  const stmt = database.prepare(query);
  stmt.run(...params);
  
  return getRecord(id);
}

/**
 * Delete a weather record
 * @param {number} id - Record ID
 * @returns {Object} Result with success and deleted_id
 */
export function deleteRecord(id) {
  const database = getDB();
  
  const existing = getRecord(id);
  if (!existing) {
    return { success: false, error: 'Record not found' };
  }
  
  const stmt = database.prepare('DELETE FROM weather_records WHERE id = ?');
  stmt.run(id);
  
  return { success: true, deleted_id: id };
}

/**
 * Get total count of records (for pagination)
 * @param {string} [search] - Optional search filter
 * @returns {number} Total count
 */
export function getRecordCount(search = '') {
  const database = getDB();
  
  let query = 'SELECT COUNT(*) as count FROM weather_records';
  const params = [];
  
  if (search) {
    query += ' WHERE location_name LIKE ?';
    params.push(`%${search}%`);
  }
  
  const stmt = database.prepare(query);
  const result = stmt.get(...params);
  
  return result.count;
}

/**
 * Close the database connection
 */
export function closeDB() {
  if (db) {
    db.close();
    db = null;
  }
}

// Initialize on module load
initDB();