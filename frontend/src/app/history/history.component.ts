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
import { saveAs } from 'file-saver';

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
    {
      dateKey: string;
      taken: number;
      eaten: number;
      data: FormulaData[];
      comment: Observable<Comment[]>;
    }[]
  > = of([]);
  commentSub?: Subscription;
  valueChangesSub?: Subscription;
  exportableData: {
    dateKey: string;
    taken: number;
    eaten: number;
    data: FormulaData[];
    comments: string;
  }[] = [];

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
      map((m) => {
        const d = m.sort((a, b) =>
          a.hourAndMinutes.localeCompare(b.hourAndMinutes)
        );
        const data: {
          dateKey: string;
          taken: number;
          eaten: number;
          data: FormulaData[];
          comment: Observable<Comment[]>;
        }[] = [];
        const dates = [...new Set(d.map((m) => m.recorded))].sort().reverse();
        for (let i of dates) {
          const filteredData = d.filter((f) => f.recorded === i);
          if (!searchText) {
            data.push({
              dateKey: i,
              taken: filteredData.reduce((acc, curr) => acc + curr.taken, 0),
              eaten: filteredData.reduce((acc, curr) => acc + curr.eaten, 0),
              data: filteredData,
              comment: this.getCommentByRecorded(i, searchText),
            });
            this.exportableData.push({
              dateKey: i,
              taken: filteredData.reduce((acc, curr) => acc + curr.taken, 0),
              eaten: filteredData.reduce((acc, curr) => acc + curr.eaten, 0),
              data: filteredData,
              comments: filteredData
                .filter((m) => m.other.length > 0)
                .map((m) => m.other)
                .join(';'),
            });
          } else {
            if (
              i.toLowerCase().includes(searchText.toLowerCase()) ||
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
                dateKey: i,
                data: filteredData,
                taken: filteredData.reduce((acc, curr) => acc + curr.taken, 0),
                eaten: filteredData.reduce((acc, curr) => acc + curr.eaten, 0),
                comment: this.getCommentByRecorded(i, searchText),
              });

              this.exportableData.push({
                dateKey: i,
                taken: filteredData.reduce((acc, curr) => acc + curr.taken, 0),
                eaten: filteredData.reduce((acc, curr) => acc + curr.eaten, 0),
                data: filteredData,
                comments: filteredData
                  .filter((m) => m.other.length > 0)
                  .map((m) => m.other)
                  .join(';'),
              });
            } else {
              this.commentSub = this.getCommentByRecorded(
                i,
                searchText
              ).subscribe((resp) => {
                if (resp.length > 0) {
                  data.push({
                    dateKey: i,
                    taken: filteredData.reduce(
                      (acc, curr) => acc + curr.taken,
                      0
                    ),
                    eaten: filteredData.reduce(
                      (acc, curr) => acc + curr.eaten,
                      0
                    ),
                    data: filteredData,
                    comment: of(resp),
                  });
                  let comment = filteredData
                    .filter((m) => m.other.length > 0)
                    .map((m) => m.other)
                    .join(';');
                  comment += resp.map((m) => m.content + ';');
                  this.exportableData.push({
                    dateKey: i,
                    taken: filteredData.reduce(
                      (acc, curr) => acc + curr.taken,
                      0
                    ),
                    eaten: filteredData.reduce(
                      (acc, curr) => acc + curr.eaten,
                      0
                    ),
                    data: filteredData,
                    comments: comment,
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
      return this.commentService.getByRecorded(recorded).pipe(
        map((m) => {
          this.exportableData.find((f) =>
            f.dateKey.includes(recorded)
          )!.comments += m.map((m) => m.content).join(';');
          return m;
        })
      );
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

  onExportClicked(): void {
    const header = ['Summary', 'Details', 'Comments'];
    let csvArray: string[] = []; // = header.join(',');
    for (let i of this.exportableData) {
      const data = i.data
        .map((m) => m.hourAndMinutes + ' - ' + m.taken + ' ml')
        .join('\r\n');

      const stringRow =
        i.dateKey +
        '\r\n' +
        data +
        ',' +
        (i.comments.length === 0
          ? '-\r\n'
          : i.comments.replace(',', ';') + '\r\n');
      csvArray.push(stringRow);
    }

    var blob = new Blob(csvArray, { type: 'text/csv' });
    saveAs(blob, 'myFile.csv');
  }
}
