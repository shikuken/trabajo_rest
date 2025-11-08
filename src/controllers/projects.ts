import { Request, Response } from 'express';
import { getDb } from '../db';

export const list = async (req: Request, res: Response) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM projects');
  await db.close();
  res.json(rows);
};

export const getOne = async (req: Request, res: Response) => {
  const db = await getDb();
  const row = await db.get('SELECT * FROM projects WHERE id = ?', req.params.id);
  await db.close();
  if (!row) return res.status(404).json({ message: 'Proyecto no encontrado' });
  res.json(row);
};

export const create = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'El nombre es requerido' });
  const db = await getDb();
  try {
    // Ignorar id enviado por el cliente; SQLite AUTOINCREMENT generará el id
    const result = await db.run('INSERT INTO projects (name, description) VALUES (?, ?)', name, description || null);
    const lastId = (result as any).lastID ?? null;
    if (lastId === null) return res.status(500).json({ message: 'No se obtuvo id al crear el proyecto' });
    const created = await db.get('SELECT * FROM projects WHERE id = ?', lastId);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error creando proyecto:', err);
    res.status(500).json({ message: 'Error interno al crear el proyecto', error: err.message });
  } finally {
    try { await db.close(); } catch (e) { /* ignore */ }
  }
};

export const update = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const db = await getDb();
  const result = await db.run(
    'UPDATE projects SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?',
    name, description, req.params.id
  );
  await db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
  res.json({ message: 'Proyecto actualizado' });
};

export const remove = async (req: Request, res: Response) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM projects WHERE id = ?', req.params.id);
  await db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
  res.json({ message: 'Proyecto eliminado' });
};
