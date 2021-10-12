import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
    storeSwitchSubject: Subject<any>;

    constructor() {
        this.storeSwitchSubject = new Subject();
     }

}
