/*
  Warnings:

  - Added the required column `balanceBefore` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.

*/
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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" TEXT,
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "photos" JSONB
);
INSERT INTO "new_MaintenanceRequest" ("categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent") SELECT "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "subcategoryId" INTEGER NOT NULL,
    "propertyId" TEXT,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientInfo" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT,
    "providerDistanceKm" REAL,
    "contractUrl" TEXT,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "preferredTimeStart" DATETIME,
    "preferredTimeEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Request_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Request_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("address", "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "geohash", "id", "lat", "lng", "preferredTimeEnd", "preferredTimeStart", "propertyId", "providerDistanceKm", "providerId", "serviceType", "status", "subcategoryId", "updatedAt", "urgent") SELECT "address", "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "geohash", "id", "lat", "lng", "preferredTimeEnd", "preferredTimeStart", "propertyId", "providerDistanceKm", "providerId", "serviceType", "status", "subcategoryId", "updatedAt", "urgent" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE INDEX "idx_request_geohash" ON "Request"("geohash");
CREATE INDEX "idx_request_clientId" ON "Request"("clientId");
CREATE TABLE "new_WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WalletAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WalletTransaction" ("accountId", "amount", "balanceAfter", "createdAt", "id", "reference", "type") SELECT "accountId", "amount", "balanceAfter", "createdAt", "id", "reference", "type" FROM "WalletTransaction";
DROP TABLE "WalletTransaction";
ALTER TABLE "new_WalletTransaction" RENAME TO "WalletTransaction";
CREATE INDEX "WalletTransaction_accountId_createdAt_idx" ON "WalletTransaction"("accountId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
