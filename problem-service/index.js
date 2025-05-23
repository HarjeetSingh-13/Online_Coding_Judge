import express from 'express';
import { config } from 'dotenv';
import problemRoutes from './routes/problemRoutes.js';
import cors from 'cors';

config();

const app = express();

app.use(cors({
  origin: process.env.USER_SERVICE_URL,
  credentials: true,
}));

app.use(express.json());

app.use('/api/problems', problemRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Problem service listening on port ${PORT}`);
});