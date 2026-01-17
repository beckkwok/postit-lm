import { Card } from '../types';
import axios from 'axios';

const API_BASE = 'api/cards';

export const getCards = async (): Promise<Card[]> => {
  const response = await axios.get(API_BASE);
  return response.data;
};

export const addCard = async (card: Omit<Card, 'id'>): Promise<Card> => {
  const response = await axios.post(API_BASE, card);
  return response.data;
};

export const updateCard = async (id: string, updates: Partial<Card>): Promise<Card> => {
  const response = await axios.put(`${API_BASE}/${id}`, updates);
  return response.data;
};

export const deleteCard = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};