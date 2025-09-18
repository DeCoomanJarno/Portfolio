import { Injectable } from '@angular/core';
import { User } from '../Models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  private adminUser: User = { email: 'admin@company.com', name: 'Admin', role: 'admin', password: "admin123" };

  constructor() {
    const storedUser = sessionStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  login(usernameOrEmail: string, password?: string): boolean {
    // Admin login
    if (usernameOrEmail === this.adminUser.email && password === this.adminUser.password) {
      this.setUser(this.adminUser);
      return true;
    }

    // Client login
    const clientsRaw = sessionStorage.getItem('clients');
    const clients: User[] = clientsRaw ? JSON.parse(clientsRaw) : [];
    const existingClient = clients.find(c => c.email === usernameOrEmail);

    if (existingClient) {
      this.setUser(existingClient);
      return true;
    }

    // client does not exist
    return false;
  }

  registerClient(user: Omit<User, 'role'>) {
    const clientsRaw = sessionStorage.getItem('clients');
    const clients: User[] = clientsRaw ? JSON.parse(clientsRaw) : [];

    const newClient: User = { ...user, role: 'client' };
    clients.push(newClient);
    sessionStorage.setItem('clients', JSON.stringify(clients));
    this.setUser(newClient);
  }

  logout() {
    sessionStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  private setUser(user: User) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
