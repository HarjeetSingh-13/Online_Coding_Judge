import express from 'express';
import dotenv from 'dotenv';
import submitRoute from './routes/submit.js';
import main from './services/resultProcessor.js';

dotenv.config();

const app = express();
app.use(express.json());

main();

app.use('/submit', submitRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Submission service listening on port ${PORT}`);
});
