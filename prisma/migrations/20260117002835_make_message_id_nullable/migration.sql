-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "messageId" INTEGER,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "sizeX" INTEGER NOT NULL,
    "sizeY" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Card_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("content", "createdAt", "id", "messageId", "positionX", "positionY", "sizeX", "sizeY") SELECT "content", "createdAt", "id", "messageId", "positionX", "positionY", "sizeX", "sizeY" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
