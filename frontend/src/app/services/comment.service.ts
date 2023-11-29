import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../model/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  url: string = environment.url + 'comment';

  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<Comment[]>(this.url);
  }

  findByPk(id: number) {
    return this.http.get<Comment>(this.url + `/${id}`);
  }

  create(data: Comment) {
    return this.http.post<Comment>(this.url, data);
  }

  put(data: Comment) {
    return this.http.put<Comment>(this.url + `/${data.id}`, data);
  }

  delete(id: number) {
    return this.http.delete<Comment>(this.url + `/${id}`);
  }

  getByRecorded(recorded: string) {
    return this.http.get<Comment[]>(this.url + `/recorded/${recorded}`);
  }
}
