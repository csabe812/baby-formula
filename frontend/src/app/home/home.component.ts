import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { Observable, map, of } from 'rxjs';
import { FormulaData } from '../model/formula-data';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [DataService],
})
export class HomeComponent implements OnInit {
  data$: Observable<FormulaData[]> = of([]);
  sumTaken = 0;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.data$ = this.dataService.fetchDataByDate(new Date()).pipe(
      map((m) => {
        for (let i of m) {
          this.sumTaken += i.taken;
        }
        return m;
      })
    );
  }
}
