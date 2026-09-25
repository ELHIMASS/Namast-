-- CreateEnum
CREATE TYPE "EntiteType" AS ENUM ('CLIENT', 'RENDEZVOUS', 'PRESTATION', 'AUTRE');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "entite" "EntiteType" NOT NULL,
    "action" "ActionType" NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);
