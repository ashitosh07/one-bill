import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { TenantOwnerDashboardRoutingModule } from './tenant-owner-dashboard-routing.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';

import { FurySharedModule } from '../../../../src/@fury/fury-shared.module';
import { TenantOwnerDashboardComponent } from './tenant-owner-dashboard/tenant-owner-dashboard.component';
import { NewsComponent } from './tenant-owner-dashboard/news/news.component';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  declarations: [TenantOwnerDashboardComponent,NewsComponent],
  imports: [
    CommonModule,
    TenantOwnerDashboardRoutingModule,
    MatCardModule,
    MaterialModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    FurySharedModule,
    MatExpansionModule
  ],
  providers: [NewsComponent, DecimalPipe]
})
export class TenantOwnerDashboardModule { }
