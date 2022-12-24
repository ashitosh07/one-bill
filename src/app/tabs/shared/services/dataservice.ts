import { Injectable } from '@angular/core';

@Injectable(
  {providedIn: 'root'})
export class DataService {

  private messageSource: boolean = false;

  constructor() { }

  public getMessage() {
    return this.messageSource;
  }

  public setMessage(message) {
    return this.messageSource = message;
  }

}