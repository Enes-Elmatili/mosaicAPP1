/*
  Warnings:

  - You are about to drop the `RequestLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `assignedProviderId` on the `Request` table. All the data in the column will be lost.
  - Added the required column `providerDistanceKm` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerName` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceType` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RequestLog";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "clientInfo" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerDistanceKm" REAL NOT NULL,
    "contractUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "priority" TEXT,
    "categoryId" INTEGER,
    "subcategoryId" INTEGER,
    "photos" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT NOT NULL,
    CONSTRAINT "Alert_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
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
    "providerId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerDistanceKm" REAL NOT NULL,
    "contractUrl" TEXT,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "geohash" TEXT NOT NULL,
    "preferredTimeStart" DATETIME,
    "preferredTimeEnd" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Request" ("address", "categoryId", "clientId", "createdAt", "description", "geohash", "id", "lat", "lng", "preferredTimeEnd", "preferredTimeStart", "status", "subcategoryId") SELECT "address", "categoryId", "clientId", "createdAt", "description", "geohash", "id", "lat", "lng", "preferredTimeEnd", "preferredTimeStart", "status", "subcategoryId" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE INDEX "idx_request_geohash" ON "Request"("geohash");
CREATE INDEX "idx_request_clientId" ON "Request"("clientId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "idx_maintenance_clientId" ON "MaintenanceRequest"("clientId");

-- CreateIndex
CREATE INDEX "idx_statushistory_requestId" ON "StatusHistory"("requestId");

-- CreateIndex
CREATE INDEX "idx_alert_requestId" ON "Alert"("requestId");
