import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import prisma from '../db/client.js';

export async function registerUser({ name, email, password, role }) {
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
      role,
      password: hashed,
      },
  });
  const token = generateToken({ userId: user.id, userRole: user.role });
  return [token, user.id];
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error('Invalid credentials');

  const { password: hashedPassword, ...safeUser } = user;
  const valid = await verifyPassword(password, hashedPassword);
  if (!valid) throw new Error('Invalid credentials');

  const token = generateToken({ userId: user.id, userRole: user.role });
  return [token, safeUser];
}
