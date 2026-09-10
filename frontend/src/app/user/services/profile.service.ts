import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../interfaces/api-response.interface';
import { ProfileResponse } from '../../auth/interfaces/profile-resp.interface';
import { map } from 'rxjs'
import { environment } from '@environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);

  getProfile() {
    return this.http
      .get<ApiResponse<ProfileResponse>>(`${environment.apiUrl}/profile`)
      .pipe(map(response => response.data));
  }
}
