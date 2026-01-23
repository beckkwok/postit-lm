import { Card } from '../types';
import axios from 'axios';

const API_BASE = 'api/cards';

export const getCards = async (): Promise<Card[]> => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const addCard = async (card: Omit<Card, 'id'>): Promise<Card> => {
  const response = await axios.post(API_BASE, card);
  return {id: response.data.id, content: 'Untitled card', position: { x: response.data.posX, y: response.data.posY }, size: { width: response.data.width, height: response.data.height } };
};

export const updateCard = async (id: string, updates: Partial<Card>): Promise<Card> => {
  const response = await axios.put(`${API_BASE}/${id}`, updates);
  return response.data;
};

export const moveCard = async (id: string, position: { x: number; y: number }): Promise<Card> => {
  const response = await axios.patch(`${API_BASE}/${id}/move`, { position });
  return response.data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};