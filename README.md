# Node Card Server

A simple Express server integrated with Prisma and SQLite.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add your API key to `.env`:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

4. Generate Prisma client:
   ```
   npx prisma generate
   ```

5. Start the server:
   ```
   npm run dev
   ```

The server will run on http://localhost:3000

## AI Integration

This server integrates with Google's Gemini AI to provide intelligent responses for the index card system. The AI assistant can help with:

- Summarizing card content
- Organizing cards by themes or categories
- Providing insights about content
- Suggesting connections between cards
- Note-taking strategies

## API Endpoints

- GET / - Hello world message
- GET /messages - Get all messages
- POST /messages - Create a new message (body: { role, content })
- GET /cards - Get all cards (with message)
- POST /cards - Create a new card (body: { content, messageId })

## Database

Uses SQLite with Prisma ORM. Database file: `prisma/dev.db`

Models: Message (id, role, content, createdAt), Card (id, content, messageId, createdAt)