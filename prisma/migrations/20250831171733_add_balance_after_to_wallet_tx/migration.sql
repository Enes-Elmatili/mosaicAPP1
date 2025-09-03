/*
  Warnings:

  - Added the required column `balanceAfter` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("clientId", "comment", "createdAt", "id", "providerId", "rating", "requestId", "updatedAt") SELECT "clientId", "comment", "createdAt", "id", "providerId", "rating", "requestId", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE UNIQUE INDEX "Review_requestId_clientId_key" ON "Review"("requestId", "clientId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isActive", "name", "password", "phone", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "name", "password", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balanceAfter" INTEGER NOT NULL,
    CONSTRAINT "WalletTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WalletAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WalletTransaction" ("accountId", "amount", "createdAt", "id", "reference", "type") SELECT "accountId", "amount", "createdAt", "id", "reference", "type" FROM "WalletTransaction";
DROP TABLE "WalletTransaction";
ALTER TABLE "new_WalletTransaction" RENAME TO "WalletTransaction";
CREATE INDEX "WalletTransaction_accountId_createdAt_idx" ON "WalletTransaction"("accountId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
