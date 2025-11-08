import express from 'express';
import { initDb } from './db';
import projectsRouter from './routes/projects';
import tasksRouter from './routes/tasks';
import peopleRouter from './routes/people';

const app = express();
app.use(express.json());

initDb(); // crea base de datos si no existe

app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/tasks', tasksRouter);
app.use('/api/v1/people', peopleRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
