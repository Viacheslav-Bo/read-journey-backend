import prisma from '../../prisma/client.js';

export const logoutUser = async (refreshToken?: string) => {
  if (!refreshToken) return;

  await prisma.session.deleteMany({ where: { refreshToken } });
};
