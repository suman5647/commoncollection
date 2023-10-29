import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { SessionService } from '../core/services/session.service';

@Pipe({
  name: 'transactionDate'
})
export class TransactionDatePipe implements PipeTransform {

  constructor(private session: SessionService) { }

  transform(value: any, format: string) {
    if (!value) { return ''; }
    if (!format) { format = 'd MMMM y'; }

    return formatDate(value, format, this.session.locale);
  }
}
