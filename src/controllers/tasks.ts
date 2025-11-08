import { Request, Response } from 'express';
import { getDb } from '../db';

export const list = async (req: Request, res: Response) => {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM tasks');
  await db.close();
  res.json(rows);
};

export const getOne = async (req: Request, res: Response) => {
  const db = await getDb();
  const row = await db.get('SELECT * FROM tasks WHERE id = ?', req.params.id);
  await db.close();
  if (!row) return res.status(404).json({ message: 'Tarea no encontrada' });
  res.json(row);
};

export const create = async (req: Request, res: Response) => {
  const { title, description, projectId } = req.body;
  if (!title) return res.status(400).json({ message: 'El título es requerido' });
  const db = await getDb();
  const result = await db.run('INSERT INTO tasks (title, description, projectId) VALUES (?, ?, ?)', title, description || null, projectId || null);
  await db.close();
  res.status(201).json({ message: 'Tarea creada', id: result.lastID });
};

export const update = async (req: Request, res: Response) => {
  const { title, description, status, projectId } = req.body;
  const db = await getDb();
  const result = await db.run(
    `UPDATE tasks SET title = COALESCE(?, title),
     description = COALESCE(?, description),
     status = COALESCE(?, status),
     projectId = COALESCE(?, projectId)
     WHERE id = ?`,
    title, description, status, projectId, req.params.id
  );
  await db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
  res.json({ message: 'Tarea actualizada' });
};

export const remove = async (req: Request, res: Response) => {
  const db = await getDb();
  const result = await db.run('DELETE FROM tasks WHERE id = ?', req.params.id);
  await db.close();
  if (result.changes === 0) return res.status(404).json({ message: 'Tarea no encontrada' });
  res.json({ message: 'Tarea eliminada' });
};
