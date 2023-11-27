import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommentService } from '../services/comment.service';
import { Comment } from '../model/comment';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss',
  providers: [CommentService],
})
export class AddCommentComponent implements OnDestroy {
  addCommentSubscription?: Subscription;
  today: string = new Date().toISOString().split('T')[0];

  form: FormGroup = new FormGroup({
    recorded: new FormControl(this.today),
    content: new FormControl(),
  });

  constructor(private commentService: CommentService, private router: Router) {}

  ngOnDestroy(): void {
    this.addCommentSubscription?.unsubscribe();
  }

  saveComment(): void {
    const comment: Comment = {
      recorded: this.form.controls.recorded.value ?? this.today,
      content: this.form.controls.content.value ?? '',
    };
    this.addCommentSubscription = this.commentService
      .addComment(comment)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}
