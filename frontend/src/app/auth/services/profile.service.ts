import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '@environments/environment.development';
import { ApiResponse } from '../../user/interfaces/api-response.interface';
import {
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UpdateProfilePhotoResponse,
} from '../interfaces/profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  private readonly profileUrl = `${environment.apiUrl}/profile`;

  getProfile(): Observable<ProfileResponse> {
    return this.http
      .get<ApiResponse<ProfileResponse>>(this.profileUrl)
      .pipe(map(response => response.data));
  }

  updateProfile(
    data: UpdateProfileRequest
  ): Observable<UpdateProfileResponse> {
    return this.http
      .patch<ApiResponse<UpdateProfileResponse>>(this.profileUrl, data)
      .pipe(map(response => response.data));
  }

  uploadProfilePhoto(
    photo: File
  ): Observable<UpdateProfilePhotoResponse> {
    const formData = new FormData();

    formData.append('photo', photo);

    return this.http
      .post<ApiResponse<UpdateProfilePhotoResponse>>(
        `${this.profileUrl}/photo`,
        formData
      )
      .pipe(map(response => response.data));
  }
}
