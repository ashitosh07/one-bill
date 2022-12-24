import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/env.service';

@Injectable({
  providedIn: 'root'
})
export class CreatenewsService {

  baseUrl = '';

  constructor(private httpClient: HttpClient,
    private envService: EnvService) {
    this.baseUrl = envService.backend;
  }

  createNews(news) {
    return this.httpClient.post(this.baseUrl + '/news', news);
  }

}
