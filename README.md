# Node Card Server

A simple Express server integrated with Prisma and SQLite.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

3. Generate Prisma client:
   ```
   npx prisma generate
   ```

4. Start the server:
   ```
   npm run dev
   ```

The server will run on http://localhost:3000

## API Endpoints

- GET / - Hello world message
- GET /messages - Get all messages
- POST /messages - Create a new message (body: { role, content })
- GET /cards - Get all cards (with message)
- POST /cards - Create a new card (body: { content, messageId })

## Database

Uses SQLite with Prisma ORM. Database file: `prisma/dev.db`

Models: Message (id, role, content, createdAt), Card (id, content, messageId, createdAt)