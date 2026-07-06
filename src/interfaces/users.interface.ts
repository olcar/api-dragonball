export type UserRole = 'admin' | 'user';

export interface IUsers {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
