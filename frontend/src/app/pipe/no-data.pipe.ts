import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noData',
  standalone: true,
})
export class NoDataPipe implements PipeTransform {
  transform(value: any) {
    if (value === 0 || value === ' ') return '';
    return value;
  }
}
