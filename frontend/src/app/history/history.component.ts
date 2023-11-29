import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { FormulaData } from '../model/formula-data';
import { Observable, Subscription, map, of } from 'rxjs';
import { NoDataPipe } from '../pipe/no-data.pipe';
import { RouterLink } from '@angular/router';
import { CommentService } from '../services/comment.service';
import { Comment } from '../model/comment';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AsyncPipe, NoDataPipe, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  providers: [DataService, CommentService],
})
export class HistoryComponent implements OnInit, OnDestroy {
  deleteSubscription?: Subscription;
  data$: Observable<
    { dateKey: string; data: FormulaData[]; comment: Observable<Comment[]> }[]
  > = of([]);

  constructor(
    private dataService: DataService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.fetchData();
  }

  fetchData() {
    this.data$ = this.dataService.fetchData().pipe(
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
          data.push({
            dateKey: key,
            data: filteredData,
            comment: this.getCommentByRecorded(i),
          });
        }
        return data;
      })
    );
  }

  getCommentByRecorded(recorded: string): Observable<Comment[]> {
    if (recorded.length === 0) return of([]);
    return this.commentService.getByRecorded(recorded);
  }

  deleteById(id: number) {
    this.deleteSubscription = this.dataService
      .deleteById(id)
      .subscribe((data) => {
        this.fetchData();
      });
  }
}
