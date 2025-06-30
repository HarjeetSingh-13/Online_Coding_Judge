import { getUser } from "../services/userServices.js";

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