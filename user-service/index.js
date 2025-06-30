import express from 'express';
import { config } from 'dotenv';
import routes from './routes/routes.js';
import cookieParser from 'cookie-parser';

config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/user', routes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
