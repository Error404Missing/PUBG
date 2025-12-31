-- Prisma Migration for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- CreateTable: User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'GUEST',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex: User username unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

-- CreateIndex: User email unique
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateTable: Team
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "logo" TEXT,
    "playerCount" INTEGER NOT NULL,
    "mapsCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "blockReason" TEXT,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leaderId" TEXT NOT NULL
);

-- CreateIndex: Team leaderId unique
CREATE UNIQUE INDEX IF NOT EXISTS "Team_leaderId_key" ON "Team"("leaderId");

-- CreateForeignKey: Team -> User
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Team_leaderId_fkey'
    ) THEN
        ALTER TABLE "Team" 
        ADD CONSTRAINT "Team_leaderId_fkey" 
        FOREIGN KEY ("leaderId") 
        REFERENCES "User"("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: Scrim
CREATE TABLE IF NOT EXISTS "Scrim" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startTime" TIMESTAMP(3) NOT NULL,
    "map" TEXT NOT NULL,
    "maxTeams" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT,
    "roomPass" TEXT
);

-- CreateTable: Slot
CREATE TABLE IF NOT EXISTS "Slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotNumber" INTEGER NOT NULL,
    "scrimId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL
);

-- CreateIndex: Slot unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Slot_scrimId_slotNumber_key" ON "Slot"("scrimId", "slotNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Slot_scrimId_teamId_key" ON "Slot"("scrimId", "teamId");

-- CreateForeignKey: Slot -> Scrim
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Slot_scrimId_fkey'
    ) THEN
        ALTER TABLE "Slot" 
        ADD CONSTRAINT "Slot_scrimId_fkey" 
        FOREIGN KEY ("scrimId") 
        REFERENCES "Scrim"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateForeignKey: Slot -> Team
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Slot_teamId_fkey'
    ) THEN
        ALTER TABLE "Slot" 
        ADD CONSTRAINT "Slot_teamId_fkey" 
        FOREIGN KEY ("teamId") 
        REFERENCES "Team"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: Result
CREATE TABLE IF NOT EXISTS "Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT NOT NULL,
    "description" TEXT,
    "scrimId" TEXT NOT NULL
);

-- CreateForeignKey: Result -> Scrim
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Result_scrimId_fkey'
    ) THEN
        ALTER TABLE "Result" 
        ADD CONSTRAINT "Result_scrimId_fkey" 
        FOREIGN KEY ("scrimId") 
        REFERENCES "Scrim"("id") 
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateTable: SystemConfig
CREATE TABLE IF NOT EXISTS "SystemConfig" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);


