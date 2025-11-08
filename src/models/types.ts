export type Project = { id?: number; name: string; description?: string; created_at?: string; };
export type Task = { id?: number; title: string; description?: string; status?: string; projectId?: number | null; created_at?: string; };
export type Person = { id?: number; name: string; email?: string; role?: string; created_at?: string; };
