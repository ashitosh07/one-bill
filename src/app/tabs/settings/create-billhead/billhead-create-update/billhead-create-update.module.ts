import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { CreateBillheadRoutingModule } from '../create-billhead-routing.module';
import { FurySharedModule } from '../../../../../@fury/fury-shared.module';
import { BillheadCreateUpdateComponent } from './billhead-create-update.component';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TitleModule } from '../../../../../@fury/shared/title/title.module';
import { PageLayoutModule } from '../../../../../@fury/shared/page-layout/page-layout.module';
import {FuryCardModule } from '../../../../../@fury/shared/card/card.module';
import { UserMasterModule } from '../../../shared/components/create-user-master/create-user-master.module';
import { DirectivesModule } from '../../../shared/custom-directives/custom-directives.module';
import { PipesModule } from '../../../shared/custom-pipes/pipes-module';

@NgModule({
  imports: [
    CommonModule,MatMenuModule, FontAwesomeModule, TitleModule,
    CreateBillheadRoutingModule, PageLayoutModule, FuryCardModule,
    FormsModule,    
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
    BreadcrumbsModule,
    UserMasterModule,
    DirectivesModule,
    PipesModule
  ],
  declarations: [BillheadCreateUpdateComponent],
  entryComponents: [BillheadCreateUpdateComponent],
  exports: [BillheadCreateUpdateComponent],
  providers: [DatePipe]
})
export class BillHeadCreateUpdateModule {
}
