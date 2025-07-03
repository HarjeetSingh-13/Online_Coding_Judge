import * as authService from '../services/authServices.js';

export async function register(req, res) {
  const { name, email, password, role } = req.body;
  const roles = ['problem-setter', 'user'];
  if (!name || !email || !password || !role || !roles.includes(role)) {
    return res.status(400).json({ error: 'Name, email, role, and password are required' });
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
    const [token, userId] = await authService.registerUser({
      name,
      email,
      password,
      role,
    });
    res.cookie("token", token, {
      path: "/",
      httpOnly: false,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "strict",
      secure: false,
    });
    res.json({ message: 'User created', token, userId });
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
    const [token, user] = await authService.loginUser({
      email,
      password,
    });
    res.cookie("token", token, {
      path: "/",
      httpOnly: false,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "strict",
      secure: false,
    });
    res.json({ message: 'Login successfully', token, user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export async function logout(req, res) {
  res.cookie("token", "", {
    path: "/",
    httpOnly: false,
    expires: new Date(0),
    sameSite: "strict",
    secure: false,
  });
  res.json({ message: 'Logout successfully' }
  )
}
