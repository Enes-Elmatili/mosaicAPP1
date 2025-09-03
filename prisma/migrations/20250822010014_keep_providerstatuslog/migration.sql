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
    "photos" JSONB NOT NULL DEFAULT []
);
INSERT INTO "new_MaintenanceRequest" ("categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent") SELECT "categoryId", "clientId", "clientInfo", "contractUrl", "createdAt", "description", "id", "photos", "priority", "propertyId", "providerDistanceKm", "providerId", "providerName", "serviceType", "status", "subcategoryId", "updatedAt", "urgent" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MAD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "id", "providerId", "status", "updatedAt") SELECT "amount", "createdAt", "currency", "id", "providerId", "status", "updatedAt" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
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
    "rankScore" REAL NOT NULL DEFAULT 0,
    "avgResponseSec" INTEGER DEFAULT 0,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "acceptedRequests" INTEGER NOT NULL DEFAULT 0,
    "declinedRequests" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeSec" INTEGER NOT NULL DEFAULT 0,
    "premium" BOOLEAN NOT NULL DEFAULT false,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Provider" ("acceptedRequests", "avgRating", "avgResponseTimeSec", "createdAt", "declinedRequests", "description", "email", "geohash", "id", "isActive", "lat", "lng", "name", "phone", "premium", "rankScore", "status", "totalRatings", "totalRequests", "updatedAt", "userId") SELECT "acceptedRequests", "avgRating", "avgResponseTimeSec", "createdAt", "declinedRequests", "description", "email", "geohash", "id", "isActive", "lat", "lng", "name", "phone", "premium", "rankScore", "status", "totalRatings", "totalRequests", "updatedAt", "userId" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");
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
    "updatedAt" DATETIME NOT NULL,
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
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("clientId", "comment", "createdAt", "id", "providerId", "rating", "requestId", "updatedAt") SELECT "clientId", "comment", "createdAt", "id", "providerId", "rating", "requestId", "updatedAt" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE UNIQUE INDEX "Review_requestId_clientId_key" ON "Review"("requestId", "clientId");
CREATE TABLE "new_Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Role" ("createdAt", "description", "id", "name", "updatedAt") SELECT "createdAt", "description", "id", "name", "updatedAt" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "phone", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "phone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
