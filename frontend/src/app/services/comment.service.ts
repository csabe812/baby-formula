import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Comment } from '../model/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  url: string = environment.url;

  constructor(private http: HttpClient) {}

  addComment(data: Comment) {
    console.log(data);

    return this.http.post<Comment>(this.url + 'add-general-comment', data);
  }

  getByRecorded(recorded: string) {
    return this.http.get<Comment[]>(
      this.url + `get-comment-by-recorded/${recorded}`
    );
  }
}
