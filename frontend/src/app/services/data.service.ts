import { Injectable } from '@angular/core';
import { FormulaData } from '../model/formula-data';
import { HttpClient } from '@angular/common/http';
import { ResponseData } from '../model/response-data';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  url: string = environment.url + 'babyformula';

  constructor(private http: HttpClient) {}

  findAll() {
    return this.http.get<FormulaData[]>(this.url);
  }

  findByPk(id: number) {
    return this.http.get<FormulaData>(this.url + `/${id}`);
  }

  create(data: FormulaData) {
    return this.http.post<FormulaData>(this.url, data);
  }

  put(data: FormulaData) {
    return this.http.put<ResponseData>(this.url + `/${data.id}`, data);
  }

  delete(id: number) {
    return this.http.delete<ResponseData>(this.url + `/${id}`);
  }

  getByRecorded(theDate: Date) {
    const parsedDate = theDate.toISOString().split('T')[0];
    return this.http.get<FormulaData[]>(this.url + `/recorded/${parsedDate}`);
  }
}
