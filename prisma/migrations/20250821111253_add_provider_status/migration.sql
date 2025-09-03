-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Provider" (
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
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Provider" ("acceptRate", "avgResponseSec", "city", "createdAt", "email", "geohash", "id", "jobsCancelled", "jobsCompleted", "jobsDisputed", "lastActiveAt", "lat", "lng", "name", "onTimeRate", "phone", "premiumBadge", "priceIndex", "rankScore", "rankScoreUpdated", "ratingsAvg", "ratingsCount", "updatedAt", "verified") SELECT "acceptRate", "avgResponseSec", "city", "createdAt", "email", "geohash", "id", "jobsCancelled", "jobsCompleted", "jobsDisputed", "lastActiveAt", "lat", "lng", "name", "onTimeRate", "phone", "premiumBadge", "priceIndex", "rankScore", "rankScoreUpdated", "ratingsAvg", "ratingsCount", "updatedAt", "verified" FROM "Provider";
DROP TABLE "Provider";
ALTER TABLE "new_Provider" RENAME TO "Provider";
CREATE INDEX "Provider_geohash_idx" ON "Provider"("geohash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
