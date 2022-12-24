import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule ,ReactiveFormsModule} from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateBilltagRoutingModule } from './create-billtag-routing.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { CreateBilltagComponent } from './create-billtag.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FuryCardModule } from '../../../../@fury/shared/card/card.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ShowErrorsModule } from '../../shared/components/show-errors/show-errors.module';


@NgModule({
  declarations: [CreateBilltagComponent],
  imports: [
    CommonModule,
    CreateBilltagRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    FlexLayoutModule,
    FuryCardModule,

    // Core
    ListModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    BreadcrumbsModule,
    ShowErrorsModule
  ],
  entryComponents: [CreateBilltagComponent],
  exports: [CreateBilltagComponent]
})
export class CreateBilltagModule { }
