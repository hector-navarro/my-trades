import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

const API_URL = '/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken: string | null = null;

  constructor(private http: HttpClient) {}

  signup(payload: { email: string; password: string; name: string }): Observable<any> {
    return this.http.post(`${API_URL}/auth/signup`, payload).pipe(
      tap((tokens: any) => this.storeTokens(tokens.accessToken))
    );
  }

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, payload).pipe(
      tap((tokens: any) => this.storeTokens(tokens.accessToken))
    );
  }

  refresh(refreshToken: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/refresh`, { refreshToken }).pipe(
      tap((tokens: any) => this.storeTokens(tokens.accessToken))
    );
  }

  logout() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }

  getToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeTokens(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }
}
