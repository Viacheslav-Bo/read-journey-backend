import { registerUser } from '../services/auth/registerUser.js';

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = await registerUser(name, email, password);

  res.status(201).json(newUser);
};
