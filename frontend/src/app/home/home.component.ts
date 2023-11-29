import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { EMPTY, Observable, Subscription, map, of } from 'rxjs';
import { FormulaData } from '../model/formula-data';
import { HttpClientModule } from '@angular/common/http';
import { NoDataPipe } from '../pipe/no-data.pipe';
import {
  ModalDismissReasons,
  NgbDatepickerModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Comment } from '../model/comment';
import { CommentService } from '../services/comment.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AsyncPipe,
    HttpClientModule,
    NoDataPipe,
    NgbDatepickerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [DataService, CommentService],
})
export class HomeComponent implements OnInit, OnDestroy {
  private modalService = inject(NgbModal);
  closeResult = '';

  data$: Observable<{
    formulaData: FormulaData[];
    comment: Observable<Comment[]>;
  }> = of({ formulaData: [], comment: of() });
  sumTaken = 0;
  deleteSubscription?: Subscription;

  id?: number;

  constructor(
    private dataService: DataService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }

  fetchData() {
    this.sumTaken = 0;
    this.data$ = this.dataService.getByRecorded(new Date()).pipe(
      map((m) => {
        const recorded = m.length > 0 ? m[0].recorded : '';
        for (let i of m) {
          this.sumTaken += i.taken;
        }
        return {
          formulaData: m,
          comment: this.getCommentByRecorded(recorded),
        };
      })
    );
  }

  getCommentByRecorded(recorded: string): Observable<Comment[]> {
    if (recorded.length === 0) return of([]);
    return this.commentService.getByRecorded(recorded);
  }

  deleteData() {
    this.deleteSubscription = this.dataService
      .delete(this.id!)
      .subscribe((data) => {
        this.fetchData();
      });
  }

  open(content: TemplateRef<any>, id: number) {
    this.id = id;
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
