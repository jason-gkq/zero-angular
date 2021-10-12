import { Injectable } from '@angular/core';
import { AbstractStorageService } from './abstract-storage.service';


@Injectable()
export class SessionStorageService extends AbstractStorageService {

  constructor() {
    super('session');
  }

}
