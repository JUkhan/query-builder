import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UtilsService {
    initSelectClause$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    );
    constructor() {}

    public initSelectClauseGeneration() {
        this.initSelectClause$.next(true);
    }
}
