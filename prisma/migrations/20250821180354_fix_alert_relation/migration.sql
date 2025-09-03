/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Property` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `photos` on the `MaintenanceRequest` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - Added the required column `providerName` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Made the column `providerId` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Payment_provider_providerRef_idx";

-- DropIndex
DROP INDEX "Payment_requestId_idx";

-- DropIndex
DROP INDEX "Provider_email_key";

-- DropIndex
DROP INDEX "Provider_geohash_idx";

-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Payment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Property";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Provider";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Rating";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

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
    CONSTRAINT "Alert_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Alert" ("id", "message", "requestId", "resolved", "timestamp", "type") SELECT "id", "message", "requestId", "resolved", "timestamp", "type" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE INDEX "idx_alert_requestId" ON "Alert"("requestId");
CREATE TABLE "new_MaintenanceRequest" (
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
    "categoryId" TEXT,
    "subcategoryId" TEXT,
    "photos" JSONB NOT NULL DEFAULT []
);
INSERT INTO "new_MaintenanceRequest" ("categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent") SELECT "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE INDEX "idx_maintenance_clientId" ON "MaintenanceRequest"("clientId");
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
    CONSTRAINT "RequestPhoto_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RequestPhoto" ("createdAt", "height", "id", "mime", "requestId", "size", "url", "width") SELECT "createdAt", "height", "id", "mime", "requestId", "size", "url", "width" FROM "RequestPhoto";
DROP TABLE "RequestPhoto";
ALTER TABLE "new_RequestPhoto" RENAME TO "RequestPhoto";
CREATE TABLE "new_StatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MaintenanceRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StatusHistory" ("id", "requestId", "status", "timestamp") SELECT "id", "requestId", "status", "timestamp" FROM "StatusHistory";
DROP TABLE "StatusHistory";
ALTER TABLE "new_StatusHistory" RENAME TO "StatusHistory";
CREATE INDEX "idx_statushistory_requestId" ON "StatusHistory"("requestId");
CREATE TABLE "new_UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "roleId"),
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserRole" ("roleId", "userId") SELECT "roleId", "userId" FROM "UserRole";
DROP TABLE "UserRole";
ALTER TABLE "new_UserRole" RENAME TO "UserRole";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
