import prisma from "../db/client.js";

export async function getUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      Submission: true,
    }
  });
  if (!user) {
    throw new Error("User not found");
  }
  const { password, ...safeUser } = user;
  return safeUser;
}