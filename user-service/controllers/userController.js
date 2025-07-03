import { getUser } from "../services/userServices.js";
import { hashPassword, verifyPassword } from '../utils/password.js';
import prisma from "../db/client.js";

export async function getUserById(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getMe(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new passwords are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await verifyPassword(currentPassword, user.password);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
