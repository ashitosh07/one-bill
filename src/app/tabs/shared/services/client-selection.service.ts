import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientSelectionService {

  private isClientVisible = new Subject<boolean>();

  isClientVisibleHandler = this.isClientVisible.asObservable();

  setIsClientVisible(value: boolean) {
    this.isClientVisible.next(value);
  }

  constructor() { }
}
