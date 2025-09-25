import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storageKey = 'currentUser';

  constructor() {}

  /** Register a new user */
  register(user: User): boolean {
    const users = this.getUsers();
    if (users.some(u => u.username === user.username)) return false;

    users.push(user);
    sessionStorage.setItem('users', JSON.stringify(users));
    return true;
  }

  /** Logout user */
  logout() {
    sessionStorage.removeItem(this.storageKey);
  }

  /** Login user */
  login(username: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) return false;

    sessionStorage.setItem(this.storageKey, JSON.stringify(user));
    return true;
  }

  /** Get currently logged-in user */
  getCurrentUser(): User | null {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  /** Update current user info */
  updateCurrentUser(user: User) {
    sessionStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  /** Get all users stored in sessionStorage */
  private getUsers(): User[] {
    const data = sessionStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  }
}
