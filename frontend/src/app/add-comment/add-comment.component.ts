import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommentService } from '../services/comment.service';
import { Comment } from '../model/comment';
import { HttpClientModule } from '@angular/common/http';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './add-comment.component.html',
  styleUrl: './add-comment.component.scss',
  providers: [CommentService],
})
export class AddCommentComponent implements OnInit, OnDestroy {
  private modalService = inject(NgbModal);
  closeResult = '';

  addCommentSubscription?: Subscription;
  today: string = new Date().toISOString().split('T')[0];
  id?: number;
  isLoading: boolean = false;

  form: FormGroup = new FormGroup({
    recorded: new FormControl(this.today, [
      Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/),
      Validators.required,
    ]),
    content: new FormControl(),
  });

  constructor(
    private commentService: CommentService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.id = +params['id'];
      this.commentService.findByPk(this.id).subscribe((data) => {
        this.form.patchValue(data);
      });
    });
  }

  ngOnDestroy(): void {
    this.addCommentSubscription?.unsubscribe();
  }

  saveComment(): void {
    this.isLoading = true;
    const comment: Comment = {
      recorded: this.form.controls.recorded.value ?? this.today,
      content: this.form.controls.content.value ?? '',
    };
    if (this.id) {
      comment.id = this.id;
      this.addCommentSubscription = this.commentService
        .put(comment)
        .subscribe((resp) => {
          this.router.navigate(['/']);
          this.isLoading = false;
        });
    } else {
      this.addCommentSubscription = this.commentService
        .create(comment)
        .subscribe((resp) => {
          this.router.navigate(['/']);
          this.isLoading = false;
        });
    }
  }

  deleteById(): void {
    this.addCommentSubscription = this.commentService
      .delete(this.id!)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  open(content: TemplateRef<any>) {
    this.modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
}
