import { prisma } from "../utils/prisma";

export async function listProjects() {
  return prisma.project.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      description: true,
    },
    orderBy: { name: "asc" },
  });
}
