import express from 'express';
import dotenv from 'dotenv';
import submitRoute from './routes/submit.js';
import main from './services/resultProcessor.js';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.USER_SERVICE_URL,
  credentials: true,
}));

app.use(express.json());

main();

app.use('/api', submitRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Submission service listening on port ${PORT}`);
});
