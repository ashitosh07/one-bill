import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { CreateMasterDetailsRoutingModule } from '../create-masterdetails-routing.module';
import { FurySharedModule } from '../../../../../@fury/fury-shared.module';
import { MasterdetailsCreateUpdateComponent } from './masterdetails-create-update.component';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
//import { MatToolbarModule } from '@angular/material/toolbar/toolbar-module';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TitleModule } from '../../../../../@fury/shared/title/title.module';
import { PageLayoutModule } from '../../../../../@fury/shared/page-layout/page-layout.module';
import {FuryCardModule } from '../../../../../@fury/shared/card/card.module';
import { UserMasterModule } from '../../../shared/components/create-user-master/create-user-master.module';

@NgModule({
  imports: [
    CommonModule,MatMenuModule, FontAwesomeModule, TitleModule,
    CreateMasterDetailsRoutingModule, PageLayoutModule, FuryCardModule,
    FormsModule, //MatToolbarModule,    
    // BrowserModule,
    UserMasterModule,
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
  declarations: [MasterdetailsCreateUpdateComponent],
  entryComponents: [MasterdetailsCreateUpdateComponent],
  exports: [MasterdetailsCreateUpdateComponent],
  providers: [DatePipe]
})
export class MasterDetailsCreateUpdateModule {
}
