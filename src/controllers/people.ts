import { Request, Response } from 'express';
import { getDb } from '../db';

export const list = async (req: Request, res: Response) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM people');
  await db.close();
  res.json(rows);
};

export const getOne = async (req: Request, res: Response) => {
  const db = await getDb();
  const row = await db.get('SELECT * FROM people WHERE id = ?', req.params.id);
  await db.close();
  if (!row) return res.status(404).json({ message: 'Persona no encontrada' });
  res.json(row);
};

export const create = async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  if (!name) return res.status(400).json({ message: 'El nombre es requerido' });
  const db = await getDb();
  try {
    // Ignorar id enviado por el cliente; SQLite AUTOINCREMENT generará el id
    const result = await db.run('INSERT INTO people (name, email, role) VALUES (?, ?, ?)', name, email || null, role || null);
    const lastId = (result as any).lastID ?? null;
    if (lastId === null) return res.status(500).json({ message: 'No se obtuvo id al crear la persona' });
    const created = await db.get('SELECT * FROM people WHERE id = ?', lastId);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('Error creando persona:', err);
    res.status(400).json({ message: err.message });
  } finally {
    try { await db.close(); } catch (e) { /* ignore */ }
  }
};

export const update = async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  const db = await getDb();
  const result = await db.run('UPDATE people SET name = COALESCE(?, name), email = COALESCE(?, email), role = COALESCE(?, role) WHERE id = ?', name, email, role, req.params.id);
  await db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Persona no encontrada' });
  res.json({ message: 'Persona actualizada' });
};

export const remove = async (req: Request, res: Response) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM people WHERE id = ?', req.params.id);
  await db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Persona no encontrada' });
  res.json({ message: 'Persona eliminada' });
};
