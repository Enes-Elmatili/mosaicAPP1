-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT,
    "balanceBefore" INTEGER NOT NULL DEFAULT 0,
    "balanceAfter" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "WalletAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WalletTransaction" ("accountId", "amount", "balanceAfter", "balanceBefore", "createdAt", "id", "reference", "type") SELECT "accountId", "amount", "balanceAfter", "balanceBefore", "createdAt", "id", "reference", "type" FROM "WalletTransaction";
DROP TABLE "WalletTransaction";
ALTER TABLE "new_WalletTransaction" RENAME TO "WalletTransaction";
CREATE INDEX "WalletTransaction_accountId_createdAt_idx" ON "WalletTransaction"("accountId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
