import { Injectable } from '@angular/core';
import { AbstractStorageService } from './abstract-storage.service';

@Injectable()
export class LocalStorageService extends AbstractStorageService {

  constructor() {
    super('local');
  }

}
