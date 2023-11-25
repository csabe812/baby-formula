import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { Observable, Subscription, map, of } from 'rxjs';
import { FormulaData } from '../model/formula-data';
import { HttpClientModule } from '@angular/common/http';
import { NoDataPipe } from '../pipe/no-data.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, HttpClientModule, NoDataPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [DataService],
})
export class HomeComponent implements OnInit, OnDestroy {
  data$: Observable<FormulaData[]> = of([]);
  sumTaken = 0;
  deleteSubscription?: Subscription;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.deleteSubscription?.unsubscribe();
  }

  fetchData() {
    this.sumTaken = 0;
    this.data$ = this.dataService.fetchDataByDate(new Date()).pipe(
      map((m) => {
        console.log(m);
        for (let i of m) {
          this.sumTaken += i.taken;
        }
        return m;
      })
    );
  }

  deleteById(id: number) {
    this.deleteSubscription = this.dataService
      .deleteById(id)
      .subscribe((data) => {
        console.log(data);
        this.fetchData();
      });
  }
}
