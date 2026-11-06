import { api } from './api';

export interface CreateUserData {
  nome: string;
  username: string;
  email: string;
  senha: string;
}

export async function createUser(data: CreateUserData) {
  const response = await api.post('/user', data);
  return response.data;
}