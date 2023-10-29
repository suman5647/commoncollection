import { BehaviorSubject, Observable, Subject } from 'rxjs'
import { switchMap, startWith, map, shareReplay } from 'rxjs/operators';
import { PageResponseData } from '../core/models/base.response.model';
import { Page, Sort, PaginationEndpoint, SimpleDataSource } from '../models/page';


export class PaginationDataSource<T> implements SimpleDataSource<T> {
    private pageNumber = new Subject<number>();
    private sort: BehaviorSubject<Sort<T>>;

    public page$: Observable<PageResponseData<T>>;

    constructor(
        endpoint: PaginationEndpoint<T>,
        size = 20) {
        this.page$ = this.sort.pipe(
            switchMap(sort => this.pageNumber.pipe(
                startWith(0),
                switchMap(page => endpoint({ page, sort, size }))
            )),
            shareReplay(1)
        )
    }

    fetch(page: number): void {
        this.pageNumber.next(page);
    }

    connect(): Observable<T[]> {
        return this.page$.pipe(map(page => page.data));
    }

    disconnect(): void { }

}