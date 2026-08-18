import { getApiClient } from './client';
import type {
  Expense,
  ExpenseListResponse,
  CreateExpenseInput,
  UpdateExpenseInput,
} from '../../types/finance';

function api() {
  return getApiClient();
}

/** Módulo tipado de despesas (Fase 6). */
export const expensesService = {
  async list(params?: { search?: string; category?: string; page?: number; limit?: number }): Promise<ExpenseListResponse> {
    const response = await api().get<ExpenseListResponse>('/expenses', { params });
    return response.data;
  },

  async getById(id: string): Promise<Expense> {
    const response = await api().get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  async create(data: CreateExpenseInput): Promise<Expense> {
    const response = await api().post<Expense>('/expenses', data);
    return response.data;
  },

  async update(id: string, data: UpdateExpenseInput): Promise<Expense> {
    const response = await api().patch<Expense>(`/expenses/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api().delete(`/expenses/${id}`);
  },
};