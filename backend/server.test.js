const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { toCard, toPrismaCard } = require('./cardMapper');
const llmService = require('./llmService');

// Mock Prisma Client
jest.mock('@prisma/client');
// Mock LLM Service
jest.mock('./llmService');
// Mock dotenv
jest.mock('dotenv');

describe('Server API Tests', () => {
  let app;
  let prisma;

  beforeAll(() => {
    // Prepare mocked prisma instance
    prisma = {
      message: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      card: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    // Make PrismaClient return our mocked prisma
    PrismaClient.mockImplementation(() => prisma);

    // Require the real server after mocks are set up
    const server = require('./server');
    app = server.app;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Basic route tests
  describe('GET /', () => {
    it('should return hello message', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello from nodecardserver!');
    });
  });

  // Message endpoint tests
  describe('GET /messages', () => {
    it('should return all messages ordered by creation time', async () => {
      const mockMessages = [
        { id: 1, role: 'user', content: 'Hello', createdAt: "'" + new Date() +"'"},
        { id: 2, role: 'assistant', content: 'Hi there', createdAt: "'" + new Date() +"'"},
      ];
      prisma.message.findMany.mockResolvedValue(mockMessages);

      const response = await request(app).get('/messages');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMessages);
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'asc' }
      });
    });

    it('should return empty array when no messages exist', async () => {
      prisma.message.findMany.mockResolvedValue([]);

      const response = await request(app).get('/messages');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /messages', () => {
    it('should create a user message and generate assistant response', async () => {
      const userMessage = { id: 1, role: 'user', content: 'Hello', createdAt: new Date() };
      const assistantMessage = { id: 2, role: 'assistant', content: 'Hello there!', createdAt: "'" + new Date() + "'" };

      prisma.message.create.mockResolvedValueOnce(userMessage);
      prisma.message.findMany.mockResolvedValueOnce([]);
      llmService.generateResponse.mockResolvedValueOnce('Hello there!');
      prisma.message.create.mockResolvedValueOnce(assistantMessage);

      const response = await request(app)
        .post('/messages')
        .send({ role: 'user', content: 'Hello' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([assistantMessage]);
      expect(prisma.message.create).toHaveBeenCalledTimes(2);
      expect(llmService.generateResponse).toHaveBeenCalledWith('Hello', {
        messages: []
      });
    }, 5000);

    it('should create an assistant message without generating response', async () => {
      const assistantMessage = { id: 1, role: 'assistant', content: 'Predefined response', createdAt: new Date() };
      prisma.message.create.mockResolvedValue(assistantMessage);

      const response = await request(app)
        .post('/messages')
        .send({ role: 'assistant', content: 'Predefined response' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(prisma.message.create).toHaveBeenCalledTimes(1);
      expect(llmService.generateResponse).not.toHaveBeenCalled();
    });

    it('should pass previous messages as context to LLM', async () => {
      const userMessage = { id: 2, role: 'user', content: 'Follow up', createdAt: new Date() };
      const previousMessage = { id: 1, role: 'assistant', content: 'Previous response', createdAt: new Date() };
      const assistantMessage = { id: 3, role: 'assistant', content: 'Follow up response', createdAt: new Date() };

      prisma.message.create.mockResolvedValueOnce(userMessage);
      prisma.message.findMany.mockResolvedValueOnce([previousMessage]);
      llmService.generateResponse.mockResolvedValueOnce('Follow up response');
      prisma.message.create.mockResolvedValueOnce(assistantMessage);

      const response = await request(app)
        .post('/messages')
        .send({ role: 'user', content: 'Follow up' });

      expect(response.status).toBe(200);
      expect(llmService.generateResponse).toHaveBeenCalledWith('Follow up', {
        messages: [previousMessage]
      });
    });
  });

  // Card endpoint tests
  describe('GET /cards', () => {
    it('should return all cards with message associations', async () => {
      const mockCards = [
        { id: 1, title: 'Card 1', content: 'Content 1', posX: 0, posY: 0, width: 200, height: 200, messageId: null, message: null },
        { id: 2, title: 'Card 2', content: 'Content 2', posX: 100, posY: 100, width: 200, height: 200, messageId: 1, message: { id: 1, role: 'user', content: 'Hello' } }
      ];
      prisma.card.findMany.mockResolvedValue(mockCards);

      const response = await request(app).get('/cards');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toEqual({
        id: '1',
        title: 'Card 1',
        content: 'Content 1',
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
        messageId: undefined
      });
      expect(response.body[1].messageId).toBe('1');
      expect(prisma.card.findMany).toHaveBeenCalledWith({
        include: { message: true }
      });
    });

    it('should return empty array when no cards exist', async () => {
      prisma.card.findMany.mockResolvedValue([]);

      const response = await request(app).get('/cards');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /cards', () => {
    it('should create a new card', async () => {
      const newCard = {
        id: 1,
        title: 'New Card',
        content: 'New content',
        posX: 50,
        posY: 50,
        width: 200,
        height: 200,
        messageId: null
      };
      prisma.card.create.mockResolvedValue(newCard);

      const response = await request(app)
        .post('/cards')
        .send({
          title: 'New Card',
          content: 'New content',
          position: { x: 50, y: 50 },
          size: { width: 200, height: 200 }
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
      expect(response.body.title).toBe('New Card');
      expect(prisma.card.create).toHaveBeenCalled();
    });

    it('should create a card with message association', async () => {
      const newCard = {
        id: 1,
        title: 'Card with Message',
        content: 'Content',
        posX: 0,
        posY: 0,
        width: 200,
        height: 200,
        messageId: 5
      };
      prisma.card.create.mockResolvedValue(newCard);

      const response = await request(app)
        .post('/cards')
        .send({
          title: 'Card with Message',
          content: 'Content',
          position: { x: 0, y: 0 },
          size: { width: 200, height: 200 },
          messageId: '5'
        });

      expect(response.status).toBe(200);
      expect(response.body.messageId).toBe('5');
    });
  });

  describe('PUT /cards/:id', () => {
    it('should update an entire card', async () => {
      const updatedCard = {
        id: 1,
        title: 'Updated Card',
        content: 'Updated content',
        posX: 100,
        posY: 100,
        width: 250,
        height: 250,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(updatedCard);

      const response = await request(app)
        .put('/cards/1')
        .send({
          title: 'Updated Card',
          content: 'Updated content',
          position: { x: 100, y: 100 },
          size: { width: 250, height: 250 }
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Card');
      expect(prisma.card.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      );
    });
  });

  describe('PATCH /cards/:id/move', () => {
    it('should move a card to new position', async () => {
      const movedCard = {
        id: 1,
        title: 'Card',
        content: 'Content',
        posX: 200,
        posY: 300,
        width: 200,
        height: 200,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(movedCard);

      const response = await request(app)
        .patch('/cards/1/move')
        .send({ position: { x: 200, y: 300 } });

      expect(response.status).toBe(200);
      expect(response.body.position).toEqual({ x: 200, y: 300 });
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          posX: 200,
          posY: 300
        }
      });
    });

    it('should return 400 for invalid position data', async () => {
      const response = await request(app)
        .patch('/cards/1/move')
        .send({ position: { x: 'invalid', y: 100 } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid position data' });
    });

    it('should return 400 when position is missing x coordinate', async () => {
      const response = await request(app)
        .patch('/cards/1/move')
        .send({ position: { y: 100 } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid position data' });
    });

    it('should return 400 when position is missing y coordinate', async () => {
      const response = await request(app)
        .patch('/cards/1/move')
        .send({ position: { x: 100 } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid position data' });
    });

    it('should return 400 when position object is null', async () => {
      const response = await request(app)
        .patch('/cards/1/move')
        .send({ position: null });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid position data' });
    });
  });

  describe('PATCH /cards/:id/resize', () => {
    it('should resize a card', async () => {
      const resizedCard = {
        id: 1,
        title: 'Card',
        content: 'Content',
        posX: 0,
        posY: 0,
        width: 300,
        height: 400,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(resizedCard);

      const response = await request(app)
        .patch('/cards/1/resize')
        .send({ size: { width: 300, height: 400 } });

      expect(response.status).toBe(200);
      expect(response.body.size).toEqual({ width: 300, height: 400 });
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          width: 300,
          height: 400
        }
      });
    });

    it('should return 400 for invalid size data', async () => {
      const response = await request(app)
        .patch('/cards/1/resize')
        .send({ size: { width: 'invalid', height: 100 } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid size data' });
    });

    it('should return 400 when size is missing width', async () => {
      const response = await request(app)
        .patch('/cards/1/resize')
        .send({ size: { height: 100 } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid size data' });
    });

    it('should return 400 when size is missing height', async () => {
      const response = await request(app)
        .patch('/cards/1/resize')
        .send({ size: { width: 100 } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid size data' });
    });

    it('should return 400 when size object is null', async () => {
      const response = await request(app)
        .patch('/cards/1/resize')
        .send({ size: null });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid size data' });
    });
  });

  describe('PATCH /cards/:id/content', () => {
    it('should update card content', async () => {
      const updatedCard = {
        id: 1,
        title: 'Card',
        content: 'New content text',
        posX: 0,
        posY: 0,
        width: 200,
        height: 200,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(updatedCard);

      const response = await request(app)
        .patch('/cards/1/content')
        .send({ content: 'New content text' });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('New content text');
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          content: 'New content text'
        }
      });
    });

    it('should return 400 for non-string content', async () => {
      const response = await request(app)
        .patch('/cards/1/content')
        .send({ content: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid content data' });
    });

    it('should return 400 when content is an object', async () => {
      const response = await request(app)
        .patch('/cards/1/content')
        .send({ content: { text: 'object' } });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid content data' });
    });

    it('should allow empty string content', async () => {
      const updatedCard = {
        id: 1,
        title: 'Card',
        content: '',
        posX: 0,
        posY: 0,
        width: 200,
        height: 200,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(updatedCard);

      const response = await request(app)
        .patch('/cards/1/content')
        .send({ content: '' });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('');
    });
  });

  describe('PATCH /cards/:id/title', () => {
    it('should update card title', async () => {
      const updatedCard = {
        id: 1,
        title: 'New Title',
        content: 'Content',
        posX: 0,
        posY: 0,
        width: 200,
        height: 200,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(updatedCard);

      const response = await request(app)
        .patch('/cards/1/title')
        .send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('New Title');
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'New Title'
        }
      });
    });

    it('should return 400 for non-string title', async () => {
      const response = await request(app)
        .patch('/cards/1/title')
        .send({ title: 456 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid title data' });
    });

    it('should return 400 when title is an array', async () => {
      const response = await request(app)
        .patch('/cards/1/title')
        .send({ title: ['title'] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid title data' });
    });

    it('should allow empty string title', async () => {
      const updatedCard = {
        id: 1,
        title: '',
        content: 'Content',
        posX: 0,
        posY: 0,
        width: 200,
        height: 200,
        messageId: null
      };
      prisma.card.update.mockResolvedValue(updatedCard);

      const response = await request(app)
        .patch('/cards/1/title')
        .send({ title: '' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('');
    });
  });

  describe('DELETE /cards/:id', () => {
    it('should delete a card and return 204', async () => {
      prisma.card.delete.mockResolvedValue({ id: 1 });

      const response = await request(app).delete('/cards/1');

      expect(response.status).toBe(204);
      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should call delete with correct card id', async () => {
      prisma.card.delete.mockResolvedValue({ id: 42 });

      const response = await request(app).delete('/cards/42');

      expect(response.status).toBe(204);
      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: 42 }
      });
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle database errors in GET /messages', async () => {
      prisma.message.findMany.mockRejectedValue( new Error('Database error'));

      const response = await request(app).get('/messages');

      expect(response.status).toBe(500);
    });

    it('should handle database errors in POST /cards', async () => {
      prisma.card.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/cards')
        .send({
          title: 'Test',
          content: 'Test content',
          position: { x: 0, y: 0 },
          size: { width: 200, height: 200 }
        });

      expect(response.status).toBe(500);
    });

    it('should handle database errors in DELETE /cards/:id', async () => {
      prisma.card.delete.mockRejectedValue(new Error('Card not found'));

      const response = await request(app).delete('/cards/999');

      expect(response.status).toBe(404);
    });
  });

  // Card mapper integration tests
  describe('Card Mapper Integration', () => {
    it('should correctly map prisma card to frontend card format', () => {
      const prismaCard = {
        id: 5,
        title: 'Test Card',
        content: 'Test content',
        posX: 100,
        posY: 200,
        width: 300,
        height: 400,
        messageId: 10
      };

      const result = toCard(prismaCard);

      expect(result).toEqual({
        id: '5',
        title: 'Test Card',
        content: 'Test content',
        position: { x: 100, y: 200 },
        size: { width: 300, height: 400 },
        messageId: '10'
      });
    });

    it('should handle null messageId in card mapping', () => {
      const prismaCard = {
        id: 1,
        title: 'Card',
        content: 'Content',
        posX: 0,
        posY: 0,
        width: 200,
        height: 200,
        messageId: null
      };

      const result = toCard(prismaCard);

      expect(result.messageId).toBeUndefined();
    });

    it('should convert frontend card to prisma format', () => {
      const frontendCard = {
        title: 'Frontend Card',
        content: 'Frontend content',
        position: { x: 50, y: 75 },
        size: { width: 250, height: 350 }
      };

      const result = toPrismaCard(frontendCard, 5);

      expect(result).toEqual({
        title: 'Frontend Card',
        content: 'Frontend content',
        posX: 50,
        posY: 75,
        width: 250,
        height: 350,
        messageId: 5
      });
    });
  });
});
