import express from 'express';
import { config } from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

config();

const app = express();

app.use(cors({
  origin: process.env.SUBMISSION_SERVICE_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', userRoutes);
app.use('/api', problemRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
