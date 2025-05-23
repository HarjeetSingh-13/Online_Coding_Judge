import express from 'express';
import { config } from 'dotenv';
import problemRoutes from './routes/problemRoutes.js';

config();

const app = express();

app.use(express.json());

app.use('/api/problems', problemRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Problem service listening on port ${PORT}`);
});