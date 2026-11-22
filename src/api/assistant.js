import { ENDPOINTS } from '../constants/endpoints';
import { apiRequest } from './client';

export async function askAssistant(question, conversation = []) {
  const { data } = await apiRequest(ENDPOINTS.ai.ask, {
    method: 'POST',
    body: { question, conversation },
  });
  return data;
}