import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateBillsettingsComponent } from './create-billsettings.component';
import { BillsettingsCreateUpdateModule } from './billsettings-create-update/billsettings-create-update.module';
import{ CreateBillsettingsRoutingModule} from './create-billsettings-routing.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';



@NgModule({
  declarations: [CreateBillsettingsComponent],
  imports: [
    CommonModule,
    CreateBillsettingsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,    
    BillsettingsCreateUpdateModule,
    BreadcrumbsModule
  ],
  exports:[CreateBillsettingsComponent]
})
export class CreateBillsettingsModule { }
