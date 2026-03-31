import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync('remont.db');
    await initializeDatabase(db);
  }
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      job_id TEXT NOT NULL,
      job_name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      measurements TEXT NOT NULL DEFAULT '{}',
      calculation_result TEXT,
      status TEXT NOT NULL DEFAULT 'planning',
      total_budget REAL,
      actual_cost REAL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shopping_items (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      estimated_price REAL NOT NULL,
      purchased INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS onboarding_completed (
      id INTEGER PRIMARY KEY,
      completed_at TEXT NOT NULL
    );
  `);
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM onboarding_completed LIMIT 1'
  );
  return result !== null;
}

export async function markOnboardingCompleted(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO onboarding_completed (id, completed_at) VALUES (1, ?)',
    [new Date().toISOString()]
  );
}

export async function getAllProjects() {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM projects ORDER BY updated_at DESC');
  return rows.map(deserializeProject);
}

export async function getProjectById(id: string) {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>('SELECT * FROM projects WHERE id = ?', [id]);
  return row ? deserializeProject(row) : null;
}

export async function saveProject(project: any): Promise<void> {
  const db = await getDatabase();
  const id = project.id || generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT OR REPLACE INTO projects
     (id, name, job_id, job_name, category_id, measurements, calculation_result, status, total_budget, actual_cost, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      project.name,
      project.jobId,
      project.jobName,
      project.categoryId,
      JSON.stringify(project.measurements || {}),
      project.calculationResult ? JSON.stringify(project.calculationResult) : null,
      project.status || 'planning',
      project.totalBudget ?? null,
      project.actualCost ?? null,
      project.notes ?? null,
      project.createdAt || now,
      now,
    ]
  );
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM shopping_items WHERE project_id = ?', [id]);
}

export async function getShoppingItems(projectId: string) {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM shopping_items WHERE project_id = ? ORDER BY purchased ASC, name ASC',
    [projectId]
  );
  return rows.map(deserializeShoppingItem);
}

export async function saveShoppingItem(item: any): Promise<string> {
  const db = await getDatabase();
  const id = item.id || generateId();

  await db.runAsync(
    `INSERT OR REPLACE INTO shopping_items
     (id, project_id, material_id, name, quantity, unit, estimated_price, purchased, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      item.projectId,
      item.materialId,
      item.name,
      item.quantity,
      item.unit,
      item.estimatedPrice,
      item.purchased ? 1 : 0,
      item.notes ?? null,
      item.createdAt || new Date().toISOString(),
    ]
  );
  return id;
}

export async function toggleShoppingItem(id: string, purchased: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE shopping_items SET purchased = ? WHERE id = ?', [purchased ? 1 : 0, id]);
}

export async function deleteShoppingItem(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM shopping_items WHERE id = ?', [id]);
}

function deserializeProject(row: any) {
  return {
    id: row.id,
    name: row.name,
    jobId: row.job_id,
    jobName: row.job_name,
    categoryId: row.category_id,
    measurements: JSON.parse(row.measurements || '{}'),
    calculationResult: row.calculation_result ? JSON.parse(row.calculation_result) : undefined,
    status: row.status,
    totalBudget: row.total_budget,
    actualCost: row.actual_cost,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function deserializeShoppingItem(row: any) {
  return {
    id: row.id,
    projectId: row.project_id,
    materialId: row.material_id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    estimatedPrice: row.estimated_price,
    purchased: row.purchased === 1,
    notes: row.notes,
    createdAt: row.created_at,
  };
}
