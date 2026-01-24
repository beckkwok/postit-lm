import { Card } from '../types';
import axios from 'axios';

const API_BASE = 'api/cards';

export const getCards = async (): Promise<Card[]> => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const addCard = async (card: Omit<Card, 'id'>): Promise<Card> => {
  const response = await axios.post(API_BASE, card);
  return {
    id: response.data.id,
    title: response.data.title,
    content: response.data.content,
    position: response.data.position,
    size: response.data.size,
    messageId: response.data.messageId
  };
};

export const addCardFromMessage = async (messageId: string, position: { x: number; y: number }): Promise<Card> => {
  const cardData = {
    title: 'Card from Message',
    content: '',
    position,
    size: { width: 300, height: 200 },
    messageId
  };
  return addCard(cardData);
};

export const updateCard = async (id: string, updates: Partial<Card>): Promise<Card> => {
  const response = await axios.put(`${API_BASE}/${id}`, updates);
  return response.data;
};

export const moveCard = async (id: string, position: { x: number; y: number }): Promise<Card> => {
  const response = await axios.patch(`${API_BASE}/${id}/move`, { position });
  return response.data;
};

export const resizeCard = async (id: string, size: { width: number; height: number }): Promise<Card> => {
  const response = await axios.patch(`${API_BASE}/${id}/resize`, { size });
  return response.data;
};

export const updateContent = async (id: string, content: string): Promise<Card> => {
  const response = await axios.patch(`${API_BASE}/${id}/content`, { content });
  return response.data;
};

export const updateTitle = async (id: string, title: string): Promise<Card> => {
  const response = await axios.patch(`${API_BASE}/${id}/title`, { title });
  return response.data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};