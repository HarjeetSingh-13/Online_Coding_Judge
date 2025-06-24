import { getUserById } from "../services/userServices";

export async function getUserById(req, res) {
  console.log('getUserById called');
  const { id } = req.params;
  console.log('User ID:', id);
  if (!id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const user = await authService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}