import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SetupsService {
  private baseUrl = '/api/v1/setups';

  constructor(private http: HttpClient) {}

  list(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  create(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }
}
