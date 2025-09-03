/*
  Warnings:

  - You are about to drop the column `providerName` on the `Request` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "lat" REAL,
    "lng" REAL,
    "geohash" TEXT,
    "city" TEXT,
    "jobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "jobsCancelled" INTEGER NOT NULL DEFAULT 0,
    "jobsDisputed" INTEGER NOT NULL DEFAULT 0,
    "ratingsAvg" REAL NOT NULL DEFAULT 0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "acceptRate" REAL NOT NULL DEFAULT 0,
    "onTimeRate" REAL NOT NULL DEFAULT 0,
    "avgResponseSec" INTEGER NOT NULL DEFAULT 0,
    "priceIndex" REAL NOT NULL DEFAULT 1,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "premiumBadge" BOOLEAN NOT NULL DEFAULT false,
    "lastActiveAt" DATETIME,
    "rankScore" REAL NOT NULL DEFAULT 0,
    "rankScoreUpdated" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "requestId" INTEGER,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Rating_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "raw" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    CONSTRAINT "Alert_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Alert" ("id", "message", "requestId", "resolved", "timestamp", "type") SELECT "id", "message", "requestId", "resolved", "timestamp", "type" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE INDEX "idx_alert_requestId" ON "Alert"("requestId");
CREATE TABLE "new_Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT,
    "categoryId" INTEGER NOT NULL,
    "subcategoryId" INTEGER NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientInfo" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT,
    "providerDistanceKm" REAL NOT NULL DEFAULT 0,
    "contractUrl" TEXT,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "preferredTimeStart" DATETIME,
    "preferredTimeEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Request_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Request_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Request_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("address", "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "geohash", "id", "lat", "lng", "preferredTimeEnd", "preferredTimeStart", "propertyId", "providerDistanceKm", "providerId", "serviceType", "status", "subcategoryId", "urgent") SELECT "address", "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "geohash", "id", "lat", "lng", "preferredTimeEnd", "preferredTimeStart", "propertyId", "providerDistanceKm", "providerId", "serviceType", "status", "subcategoryId", "urgent" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE INDEX "idx_request_geohash" ON "Request"("geohash");
CREATE INDEX "idx_request_clientId" ON "Request"("clientId");
CREATE TABLE "new_RequestPhoto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "mime" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequestPhoto_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RequestPhoto" ("createdAt", "height", "id", "mime", "requestId", "size", "url", "width") SELECT "createdAt", "height", "id", "mime", "requestId", "size", "url", "width" FROM "RequestPhoto";
DROP TABLE "RequestPhoto";
ALTER TABLE "new_RequestPhoto" RENAME TO "RequestPhoto";
CREATE TABLE "new_StatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StatusHistory" ("id", "requestId", "status", "timestamp") SELECT "id", "requestId", "status", "timestamp" FROM "StatusHistory";
DROP TABLE "StatusHistory";
ALTER TABLE "new_StatusHistory" RENAME TO "StatusHistory";
CREATE INDEX "idx_statushistory_requestId" ON "StatusHistory"("requestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Provider_geohash_idx" ON "Provider"("geohash");

-- CreateIndex
CREATE INDEX "Payment_requestId_idx" ON "Payment"("requestId");

-- CreateIndex
CREATE INDEX "Payment_provider_providerRef_idx" ON "Payment"("provider", "providerRef");
