import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

import { OpenTicketsDashboardRoutingModule } from './open-tickets-dashboard-routing.module';
import { OpenTicketsDashboardComponent } from './open-tickets-dashboard.component';
import { MatCardModule } from '@angular/material/card';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FurySharedModule } from 'src/@fury/fury-shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { TicketlistModule } from '../../tickets/ticketlist/ticketlist.module';
import { TicketlistComponent } from '../../tickets/ticketlist/ticketlist.component';
// import { StyledListComponent } from '../../styled-list/styled-list.component';
// import { StyledLIstModule } from '../../styled-list/styled-list.module';


@NgModule({
  declarations: [OpenTicketsDashboardComponent],
  imports: [
    CommonModule,
    OpenTicketsDashboardRoutingModule,
    MatCardModule,
    MaterialModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    FurySharedModule,
    MatExpansionModule,
    TicketlistModule
  ],
  providers: [TicketlistComponent,DecimalPipe]
})
export class OpenTicketsDashboardModule { }
