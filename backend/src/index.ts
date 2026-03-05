import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db_mongo';
import apiRouter from './api/routes';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGENES?.split(',') ?? 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));

// ─── Start ───────────────────────────────────────────────────────────────────
const start = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀  Server running on port ${PORT}`));
};

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
