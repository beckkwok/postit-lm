/*
  Warnings:

  - Added the required column `positionX` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionY` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeX` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeY` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "positionX" REAL NOT NULL,
    "positionY" REAL NOT NULL,
    "sizeX" REAL NOT NULL,
    "sizeY" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("content", "createdAt", "id", "messageId") SELECT "content", "createdAt", "id", "messageId" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
