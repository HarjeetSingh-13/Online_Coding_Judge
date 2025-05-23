import express from 'express';
import { config } from 'dotenv';
import prisma from './db/client.js';

config();
const app = express();

async function init() {
  try {
    // const user = await prisma.user.create({
    //   data: {
    //     name: 'John Doe',
    //     email: 'johndoe@gmail.com',
    //     password: 'password123',
    //   },
    // });
    // console.log('User created:', user);

    const users = await prisma.user.findMany();
    console.log('All users:', users);
  } catch (error) {
    console.error('Error during DB operations:', error);
  }
}

init();

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
