import { Injectable } from '@angular/core';
import { FormulaData } from '../model/formula-data';
import { HttpClient } from '@angular/common/http';
import { Util } from '../util/util';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  url: string = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  addData(data: FormulaData) {
    return this.http.post<FormulaData>(this.url + 'add', data);
  }

  fetchDataByDate(theDate: Date) {
    const parsedDate = Util.dateParser(theDate);
    return this.http.get<FormulaData[]>(
      this.url + `get-data-by-date/${parsedDate}`
    );
  }
}
