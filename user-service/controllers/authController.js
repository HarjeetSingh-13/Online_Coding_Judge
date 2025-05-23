import * as authService from '../services/authServices.js';

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(name)) {
    return res.status(400).json({ error: 'Name can only contain alphanumeric characters' });
  }
  if (name.length < 3 || name.length > 20) {
    return res.status(400).json({ error: 'Name must be between 3 and 20 characters long' });
  }
  if (email.length < 5 || email.length > 50) {
    return res.status(400).json({ error: 'Email must be between 5 and 50 characters long' });
  }
  try {
    const token = await authService.registerUser({
      name,
      email,
      password,
    });
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
    res.json({ message: 'User created', token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const token = await authService.loginUser({
      email,
      password,
    });
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
    res.json({ message: 'Login successfully', token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export async function logout(req, res) {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  res.json({ message: 'Logout successfully' }
  )
}
