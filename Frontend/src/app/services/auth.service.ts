import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5073/api/auth';
  private readonly storageKey = 'money_bank_user';

  // Reactive Signal for current authenticated user
  public currentUser = signal<AuthResponse | null>(this.loadUserFromStorage());

  public isAuthenticated = computed(() => !!this.currentUser());
  public isCustomer = computed(() => this.currentUser()?.role === 'Customer');
  public isManager = computed(() => this.currentUser()?.role === 'Manager');

  constructor(private http: HttpClient) {}

  private loadUserFromStorage(): AuthResponse | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public register(data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    initialDeposit?: number;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {
        this.setUser(res);
      })
    );
  }

  public login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.setUser(res);
      })
    );
  }

  public setUser(user: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUser.set(user);
  }

  public updateBalance(newBalance: number): void {
    const user = this.currentUser();
    if (user) {
      const updated = { ...user, balance: newBalance };
      this.setUser(updated);
    }
  }

  public logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUser.set(null);
  }
}
