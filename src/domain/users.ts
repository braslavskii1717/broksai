export type UserRole = 'broker' | 'buyer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: UserRole;
}
