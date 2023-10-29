import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { PageResponseData } from '../core/models/base.response.model';

export interface Sort<T> {
  property: keyof T;
  order: 'asc' | 'desc';
}

export interface PageRequest<T> {
  page: number;
  size: number;
  sort?: Sort<T>;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

export type PaginationEndpoint<T> = (req: PageRequest<T>) => Observable<PageResponseData<T>>

export interface SimpleDataSource<T> extends DataSource<T> {
  connect(): Observable<T[]>;
  disconnect(): void;
}