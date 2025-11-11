import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trade } from '../models/trade.model';

const API_URL = '/api/v1/trades';

@Injectable({ providedIn: 'root' })
export class TradesService {
  constructor(private http: HttpClient) {}

  list(params: Record<string, any>): Observable<Trade[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value as any);
      }
    });
    return this.http.get<Trade[]>(API_URL, { params: httpParams });
  }

  get(id: string): Observable<Trade> {
    return this.http.get<Trade>(`${API_URL}/${id}`);
  }

  create(payload: any): Observable<Trade> {
    return this.http.post<Trade>(API_URL, payload);
  }

  addEvent(id: string, payload: any): Observable<Trade> {
    return this.http.post<Trade>(`${API_URL}/${id}/events`, payload);
  }
}
