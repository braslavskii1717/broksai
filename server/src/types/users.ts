export type UserRole = 'broker' | 'buyer' | 'admin';

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: UserRole;
};
