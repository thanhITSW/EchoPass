-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CapsuleStatus" AS ENUM ('PROCESSING', 'READY', 'OPENED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Capsule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "imageUrl" TEXT,
    "voiceUrl" TEXT,
    "status" "CapsuleStatus" NOT NULL DEFAULT 'PROCESSING',
    "openDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Capsule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "keywords" TEXT[],
    "futureLetter" TEXT NOT NULL,
    "advice" TEXT NOT NULL,
    "obstacles" TEXT[],
    "audioUrl" TEXT,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "capsuleId" TEXT NOT NULL,
    "reflection" TEXT NOT NULL,
    "analysis" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Capsule_userId_idx" ON "Capsule"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_capsuleId_key" ON "AIAnalysis"("capsuleId");

-- CreateIndex
CREATE INDEX "Reflection_capsuleId_idx" ON "Reflection"("capsuleId");

-- AddForeignKey
ALTER TABLE "Capsule" ADD CONSTRAINT "Capsule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reflection" ADD CONSTRAINT "Reflection_capsuleId_fkey" FOREIGN KEY ("capsuleId") REFERENCES "Capsule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
