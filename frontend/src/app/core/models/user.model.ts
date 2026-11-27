/**
 * user.model.ts — TypeScript Interfaces for Users & Authentication Responses
 *
 * Defines `UserRole`, `User`, `AuthResponse` (returned by login/register),
 * and `UserListResponse` (paginated user list for the admin dashboard).
 */
export type UserRole = 'client' | 'restaurateur' | 'admin';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  isActive: boolean;
  photoProfil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}
