import { Message } from '../types';
import axios from 'axios';

const API_BASE = 'api/messages';

export const getMessages = async (): Promise<Message[]> => {
  const response = await axios.get(API_BASE);
  return response.data.map((msg: any) => ({
    id: msg.id.toString(),
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.createdAt),
  }));
};

export const sendMessage = async (role: 'user' | 'assistant', content: string): Promise<Message[]> => {
  const response = await axios.post(API_BASE, { role, content });
  return response.data.map((msg: any) => ({
    id: msg.id.toString(),
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.createdAt),
  }));
};