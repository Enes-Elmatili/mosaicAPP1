/*
  Warnings:

  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to drop the column `avgResponseSec` on the `Provider` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WalletAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WalletAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MaintenanceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientInfo" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT,
    "providerName" TEXT,
    "providerDistanceKm" REAL,
    "contractUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "priority" TEXT,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "photos" JSONB
);
INSERT INTO "new_MaintenanceRequest" ("categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent") SELECT "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "id", "providerId", "status", "updatedAt") SELECT "amount", "createdAt", "currency", "id", "providerId", "status", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE INDEX "Payment_providerId_createdAt_idx" ON "Payment"("providerId", "createdAt");
CREATE TABLE "new_Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "description" TEXT,
    "lat" REAL,
    "lng" REAL,
    "geohash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "avgRating" REAL NOT NULL DEFAULT 0,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "acceptedRequests" INTEGER NOT NULL DEFAULT 0,
    "declinedRequests" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeSec" INTEGER NOT NULL DEFAULT 0,
    "rankScore" REAL NOT NULL DEFAULT 0,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Provider" ("acceptedRequests", "avgRating", "avgResponseTimeSec", "city", "createdAt", "declinedRequests", "description", "email", "geohash", "id", "isActive", "jobsCompleted", "lat", "lng", "name", "phone", "premium", "rankScore", "status", "totalRatings", "totalRequests", "updatedAt", "userId") SELECT "acceptedRequests", "avgRating", "avgResponseTimeSec", "city", "createdAt", "declinedRequests", "description", "email", "geohash", "id", "isActive", "jobsCompleted", "lat", "lng", "name", "phone", "premium", "rankScore", "status", "totalRatings", "totalRequests", "updatedAt", "userId" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");
CREATE INDEX "Provider_geohash_idx" ON "Provider"("geohash");
CREATE INDEX "Provider_status_idx" ON "Provider"("status");
CREATE INDEX "Provider_rankScore_idx" ON "Provider"("rankScore");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "phone", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_userId_key" ON "WalletAccount"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_accountId_createdAt_idx" ON "WalletTransaction"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderStatusLog_providerId_changedAt_idx" ON "ProviderStatusLog"("providerId", "changedAt");
