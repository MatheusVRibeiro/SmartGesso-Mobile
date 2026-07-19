export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: Address;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
