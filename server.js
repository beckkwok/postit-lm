const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from nodecardserver!');
});

// Example route to get messages
app.get('/messages', async (req, res) => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'asc' }
  });
  res.json(messages);
});

// Example route to create a message
app.post('/messages', async (req, res) => {
  const { role, content } = req.body;
  const message = await prisma.message.create({
    data: { role, content },
  });
  res.json(message);
});

// Example route to get cards
app.get('/cards', async (req, res) => {
  const cards = await prisma.card.findMany({
    include: { message: true },
  });
  res.json(cards);
});

// Example route to create a card
app.post('/cards', async (req, res) => {
  const { content, messageId } = req.body;
  const card = await prisma.card.create({
    data: { content, messageId },
  });
  res.json(card);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});