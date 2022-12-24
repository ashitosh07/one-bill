import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../../@fury/fury-shared.module';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TitleModule } from '../../../../../@fury/shared/title/title.module';
import { PageLayoutModule } from '../../../../../@fury/shared/page-layout/page-layout.module';
import { FuryCardModule } from '../../../../../@fury/shared/card/card.module';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { CreateServiceDisconnectionRoutingModule } from '../create-service-disconnection-routing.module';
import { ServiceDisconnectionCreateUpdateComponent } from './service-disconnection-create-update.component';


@NgModule({
  imports: [
    CommonModule,MatMenuModule, FontAwesomeModule, TitleModule,
    PageLayoutModule, FuryCardModule,
    CreateServiceDisconnectionRoutingModule,
    FormsModule,    
    // BrowserModule,
    MaterialModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    FurySharedModule,  
    ShowErrorsModule,
    ListModule,
    BreadcrumbsModule
  ],
  declarations: [ServiceDisconnectionCreateUpdateComponent],
  entryComponents: [ServiceDisconnectionCreateUpdateComponent],
  exports: [ServiceDisconnectionCreateUpdateComponent],
  providers: [DatePipe]
})
export class ServiceDisconnectionCreateUpdateModule {
}