import { Injectable } from '@angular/core';
import { FormulaData } from '../model/formula-data';
import { HttpClient } from '@angular/common/http';
import { ResponseData } from '../model/response-data';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  url: string = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  addData(data: FormulaData) {
    return this.http.post<FormulaData>(this.url + 'add', data);
  }

  fetchData() {
    return this.http.get<FormulaData[]>(this.url + `history`);
  }

  fetchDataByDate(theDate: Date) {
    const parsedDate = theDate.toISOString().split('T')[0];
    return this.http.get<FormulaData[]>(
      this.url + `get-data-by-date/${parsedDate}`
    );
  }

  deleteById(id: number) {
    return this.http.delete<ResponseData>(this.url + `delete/${id}`);
  }
}
