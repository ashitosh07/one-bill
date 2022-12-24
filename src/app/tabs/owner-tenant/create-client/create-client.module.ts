import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateClientRoutingModule } from './create-client-routing.module';
import { CreateClientComponent } from './create-client.component';
import { ClientCreateUpdateModule } from './client-create-update/client-create-update.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { TenantDetailsComponent } from './tenant-details/tenant-details.component';

@NgModule({
  imports: [
    CommonModule,
    CreateClientRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    ClientCreateUpdateModule,
    BreadcrumbsModule
  ],
  declarations: [CreateClientComponent,TenantDetailsComponent],
  exports: [CreateClientComponent,TenantDetailsComponent]
})
export class CreateClientModule {
}
