import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import walletRoutes from './routes/wallet.js';
import caseRoutes from './routes/cases.js';
import communityRoutes from './routes/community.js';
import volunteerRoutes from './routes/volunteers.js';
import adminRoutes from './routes/admin.js';
import ledgerRoutes from './routes/ledger.js';
import paymentRoutes from './routes/payments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/straycare')
  .then(() => {
    app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
