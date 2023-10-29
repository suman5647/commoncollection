import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { SessionService } from '../core/services/session.service';

@Pipe({
  name: 'TransactionDateTimePipe'
})

export class TransactionDateTimePipe implements PipeTransform {

  constructor(private session: SessionService) { }

  transform(value: any, format: string) {
    if (!value) { return ''; }
    if (!format) { format = 'd MMMM y, h:mm:ss a zzzz '; }

    return formatDate(value, format, this.session.locale);
  }
}