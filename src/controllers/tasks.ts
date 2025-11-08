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
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'El título es requerido' });
  const db = await getDb();
  try {
    // Ignorar cualquier id provisto por el cliente: la DB generará el id AUTOINCREMENT
    const result = await db.run(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
      title,
      description || null
    );

    const lastId = (result as any).lastID ?? null;
    if (lastId === null) return res.status(500).json({ message: 'No se obtuvo id al crear la tarea' });

    const created = await db.get('SELECT * FROM tasks WHERE id = ?', lastId);
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creando tarea:', err);
    res.status(500).json({ message: 'Error interno al crear la tarea', error: (err as Error).message });
  } finally {
    try { await db.close(); } catch (e) { /* ignore close errors */ }
  }
};

export const update = async (req: Request, res: Response) => {
  const { title, description, status } = req.body;
  const db = await getDb();
  const result = await db.run(
    `UPDATE tasks SET title = COALESCE(?, title),
     description = COALESCE(?, description),
     status = COALESCE(?, status)
     WHERE id = ?`,
    title, description, status, req.params.id
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
