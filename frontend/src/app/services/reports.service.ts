import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private baseUrl = '/api/v1/reports';

  constructor(private http: HttpClient) {}

  overview(params: Record<string, any>): Observable<any> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });
    return this.http.get(`${this.baseUrl}/overview`, { params: httpParams });
  }

  errors(): Observable<any> {
    return this.http.get(`${this.baseUrl}/errors`);
  }
}
