import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateBillheadRoutingModule } from './create-billhead-routing.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateBillheadComponent } from './create-billhead.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FuryCardModule } from '../../../../@fury/shared/card/card.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ShowErrorsModule } from '../../shared/components/show-errors/show-errors.module';
import { BillHeadCreateUpdateModule } from './billhead-create-update/billhead-create-update.module';
import { CopyBillLinesComponent } from './copy-bill-lines/copy-bill-lines.component'
import { UserConfirmationDialogModule } from '../../shared/components/user-confirmation-dialog/user-confirmation-dialog.module';



@NgModule({
  declarations: [CreateBillheadComponent, CopyBillLinesComponent],
  imports: [
    CommonModule,
    CreateBillheadRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    FlexLayoutModule,
    FuryCardModule,
    BillHeadCreateUpdateModule,
    // Core
    ListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    BreadcrumbsModule,
    ShowErrorsModule,
    UserConfirmationDialogModule
  ],
  entryComponents: [CreateBillheadComponent],
   exports: [CreateBillheadComponent]
})
export class CreateBillheadModule { }
