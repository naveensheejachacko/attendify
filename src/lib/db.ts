import { PrismaClient } from "@prisma/client";

const CLIENT_REV = 3;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaRev?: number;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

if (globalForPrisma.prismaRev !== CLIENT_REV) {
  void globalForPrisma.prisma?.$disconnect();
  globalForPrisma.prisma = createClient();
  globalForPrisma.prismaRev = CLIENT_REV;
}

export const prisma = globalForPrisma.prisma;
