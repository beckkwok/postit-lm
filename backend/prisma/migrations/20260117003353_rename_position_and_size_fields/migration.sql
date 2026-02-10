/*
  Warnings:

  - You are about to drop the `Position` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `sizeX` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `sizeY` on the `Card` table. All the data in the column will be lost.
  - Added the required column `height` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posX` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posY` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Position_cardId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Position";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "messageId" INTEGER,
    "posX" INTEGER NOT NULL,
    "posY" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("content", "createdAt", "id", "messageId") SELECT "content", "createdAt", "id", "messageId" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
