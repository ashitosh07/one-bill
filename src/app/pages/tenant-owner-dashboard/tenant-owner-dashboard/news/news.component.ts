import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TenantOwnerDashboardService } from '../tenant-owner-dashboard.service';

@Component({
  selector: 'fury-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  lstNews = [];

  divHeight = '50px';

  panelOpenState = [];
  ownerId: number;

  constructor(
    private tenantOwnerService: TenantOwnerDashboardService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.getNews();
  }

  getNews() {
    this.ownerId = Number(this.cookieService.get('ownerId'));
    this.tenantOwnerService.getNews(this.ownerId).subscribe((response: any) => {
      if (response) {

        this.lstNews = [];

        this.lstNews = response;//['news'];

      }
    })

  }

}

