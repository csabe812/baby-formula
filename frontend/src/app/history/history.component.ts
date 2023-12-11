import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { FormulaData } from '../model/formula-data';
import {
  Observable,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  tap,
} from 'rxjs';
import { NoDataPipe } from '../pipe/no-data.pipe';
import { RouterLink } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { Comment } from '../model/comment';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    AsyncPipe,
    NoDataPipe,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  providers: [DataService, CommentService],
})
export class HistoryComponent implements OnInit, OnDestroy {
  deleteSubscription?: Subscription;
  data$: Observable<
    { dateKey: string; data: FormulaData[]; comment: Observable<Comment[]> }[]
  > = of([]);
  commentSub?: Subscription;
  valueChangesSub?: Subscription;

  form: FormGroup = new FormGroup({
    searchText: new FormControl(''),
  });

  constructor(
    private dataService: DataService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.fetchData();
    this.valueChangesSub = this.form.valueChanges
      .pipe(
        debounceTime(500),
        map((data) => {
          this.fetchData(data.searchText);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.commentSub?.unsubscribe();
    this.deleteSubscription?.unsubscribe();
    this.valueChangesSub?.unsubscribe();
  }

  fetchData(searchText?: string) {
    this.data$ = this.dataService.findAll().pipe(
      map((d) => {
        const data: {
          dateKey: string;
          data: FormulaData[];
          comment: Observable<Comment[]>;
        }[] = [];
        const dates = [...new Set(d.map((m) => m.recorded))].sort().reverse();
        for (let i of dates) {
          const filteredData = d.filter((f) => f.recorded === i);
          const key =
            i +
            ', ' +
            filteredData.reduce((acc, curr) => acc + curr.taken, 0) +
            ' ml';
          if (!searchText) {
            data.push({
              dateKey: key,
              data: filteredData,
              comment: this.getCommentByRecorded(i, searchText),
            });
          } else {
            if (
              key.toLowerCase().includes(searchText.toLowerCase()) ||
              filteredData.find(
                (f) =>
                  f.hourAndMinutes
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
                  f.other.toLowerCase().includes(searchText.toLowerCase()) ||
                  ('' + f.taken)
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
              )
            ) {
              data.push({
                dateKey: key,
                data: filteredData,
                comment: this.getCommentByRecorded(i, searchText),
              });
            } else {
              this.commentSub = this.getCommentByRecorded(
                i,
                searchText
              ).subscribe((resp) => {
                if (resp.length > 0) {
                  data.push({
                    dateKey: key,
                    data: filteredData,
                    comment: of(resp),
                  });
                }
              });
            }
          }
        }
        return data;
      })
    );
  }

  getCommentByRecorded(
    recorded: string,
    searchText?: string
  ): Observable<Comment[]> {
    if (recorded.length === 0) return of([]);
    if (!searchText) {
      return this.commentService.getByRecorded(recorded);
    } else {
      return this.commentService.getByRecorded(recorded).pipe(
        map((d) => {
          const resp = d.filter((f) =>
            f.content.toLowerCase().includes(searchText.toLowerCase())
          );
          return resp;
        })
      );
    }
  }

  deleteById(id: number) {
    this.deleteSubscription = this.dataService.delete(id).subscribe((data) => {
      this.fetchData();
    });
  }

  clearText() {
    this.form.reset();
    this.fetchData();
  }
}
