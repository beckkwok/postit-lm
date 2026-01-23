const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { toCard, toPrismaCard } = require('./cardMapper');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Hello from nodecardserver!');
});

// Route to get messages
app.get('/messages', async (req, res) => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'asc' }
  });
  res.json(messages);
});

// Route to create a message
app.post('/messages', async (req, res) => {
  const { role, content } = req.body;
  const message = await prisma.message.create({
    data: { role, content },
  });
  res.json(message);
});

// Route to get cards
app.get('/cards', async (req, res) => {
  const prismaCards = await prisma.card.findMany({
    include: { message: true },
  });
  const cards = prismaCards.map(toCard);
  res.json(cards);
});

// Route to create a card
app.post('/cards', async (req, res) => {
  let prismaData = toPrismaCard(req.body, null);
  const prismaCard = await prisma.card.create({
    data: prismaData,
  });
  const createdCard = toCard(prismaCard);
  res.json(createdCard);
});

// Route to update a card
app.put('/cards/:id', async (req, res) => {
  const { id } = req.params;
  const card = req.body;
  const prismaData = toPrismaCard(card, null);
  const prismaCard = await prisma.card.update({
    where: { id: parseInt(id) },
    data: prismaData,
  });
  const updatedCard = toCard(prismaCard);
  res.json(updatedCard);
});

// Route to move a card
app.patch('/cards/:id/move', async (req, res) => {
  const { id } = req.params;
  const { position } = req.body;
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    return res.status(400).json({ error: 'Invalid position data' });
  }
  const prismaCard = await prisma.card.update({
    where: { id: parseInt(id) },
    data: {
      posX: position.x,
      posY: position.y
    },
  });
  const updatedCard = toCard(prismaCard);
  res.json(updatedCard);
});

// Route to resize a card
app.patch('/cards/:id/resize', async (req, res) => {
  const { id } = req.params;
  const { size } = req.body;
  if (!size || typeof size.width !== 'number' || typeof size.height !== 'number') {
    return res.status(400).json({ error: 'Invalid size data' });
  }
  const prismaCard = await prisma.card.update({
    where: { id: parseInt(id) },
    data: {
      width: size.width,
      height: size.height
    },
  });
  const updatedCard = toCard(prismaCard);
  res.json(updatedCard);
});

// Route to update card content
app.patch('/cards/:id/content', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content data' });
  }
  const prismaCard = await prisma.card.update({
    where: { id: parseInt(id) },
    data: {
      content: content
    },
  });
  const updatedCard = toCard(prismaCard);
  res.json(updatedCard);
});

// Route to update card title
app.patch('/cards/:id/title', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (typeof title !== 'string') {
    return res.status(400).json({ error: 'Invalid title data' });
  }
  const prismaCard = await prisma.card.update({
    where: { id: parseInt(id) },
    data: {
      title: title
    },
  });
  const updatedCard = toCard(prismaCard);
  res.json(updatedCard);
});

// Route to delete a card
app.delete('/cards/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.card.delete({
    where: { id: parseInt(id) },
  });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});