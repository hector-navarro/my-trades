import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RiskService {
  private baseUrl = '/api/v1/risk-policy';

  constructor(private http: HttpClient) {}

  getPolicy(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  updatePolicy(payload: any): Observable<any> {
    return this.http.put(this.baseUrl, payload);
  }
}
