/*
  Warnings:

  - You are about to alter the column `positionX` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `positionY` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `sizeX` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `sizeY` on the `Card` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "sizeX" INTEGER NOT NULL,
    "sizeY" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("content", "createdAt", "id", "messageId", "positionX", "positionY", "sizeX", "sizeY") SELECT "content", "createdAt", "id", "messageId", "positionX", "positionY", "sizeX", "sizeY" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
