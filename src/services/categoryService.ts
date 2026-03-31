import api from '@/services/api';

export interface Category {
  id: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
}

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories').then((res) => res.data),

  create: (data: CategoryRequest) =>
    api.post<Category>('/categories', data).then((res) => res.data),

  update: (id: number, data: CategoryRequest) =>
    api.put<Category>(`/categories/${id}`, data).then((res) => res.data),

  delete: (id: number) => api.delete(`/categories/${id}`).then(() => undefined),
};
