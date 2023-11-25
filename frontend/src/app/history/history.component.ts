import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { FormulaData } from '../model/formula-data';
import { Observable, Subscription, map, of } from 'rxjs';
import { NoDataPipe } from '../pipe/no-data.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HttpClientModule, AsyncPipe, NoDataPipe, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  providers: [DataService],
})
export class HistoryComponent implements OnInit, OnDestroy {
  deleteSubscription?: Subscription;
  data$: Observable<{ dateKey: string; data: FormulaData[] }[]> = of([]);

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.fetchData();
  }

  fetchData() {
    this.data$ = this.dataService.fetchData().pipe(
      map((d) => {
        const data: { dateKey: string; data: FormulaData[] }[] = [];
        const dates = [...new Set(d.map((m) => m.recorded))].sort().reverse();
        for (let i of dates) {
          data.push({ dateKey: i, data: d.filter((f) => f.recorded === i) });
        }
        return data;
      })
    );
  }

  deleteById(id: number) {
    this.deleteSubscription = this.dataService
      .deleteById(id)
      .subscribe((data) => {
        this.fetchData();
      });
  }
}
