import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import prisma from '../db/client.js';

export async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new Error('Email already registered');
  }
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
      data: {
      name,
      email,
      password: hashed,
      },
  });
  const token = generateToken({ userId: user.id });
  return token;
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error('Invalid credentials');

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken({ userId: user.id });
  return token;
}
