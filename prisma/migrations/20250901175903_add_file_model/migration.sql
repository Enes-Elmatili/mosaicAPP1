-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "original" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Provider" ("acceptedRequests", "avgRating", "avgResponseTimeSec", "city", "createdAt", "declinedRequests", "description", "email", "geohash", "id", "isActive", "jobsCompleted", "lastActiveAt", "lat", "lng", "name", "phone", "premium", "rankScore", "status", "totalRatings", "totalRequests", "updatedAt", "userId") SELECT "acceptedRequests", "avgRating", "avgResponseTimeSec", "city", "createdAt", "declinedRequests", "description", "email", "geohash", "id", "isActive", "jobsCompleted", "lastActiveAt", "lat", "lng", "name", "phone", "premium", "rankScore", "status", "totalRatings", "totalRequests", "updatedAt", "userId" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");
CREATE INDEX "Provider_geohash_idx" ON "Provider"("geohash");
CREATE INDEX "Provider_status_idx" ON "Provider"("status");
CREATE INDEX "Provider_rankScore_idx" ON "Provider"("rankScore");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
