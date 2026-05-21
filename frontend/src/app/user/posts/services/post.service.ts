import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  searchByNumber(query: string) {
    return this.http.get('');
  }
}
