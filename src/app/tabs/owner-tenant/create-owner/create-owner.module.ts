import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { CreateOwnerRoutingModule } from './create-owner-routing.module';
import { CreateOwnerComponent } from './create-owner.component';
import { OwnerCreateUpdateModule } from './owner-create-update/owner-create-update.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { FuryCardModule } from 'src/@fury/shared/card/card.module';
import { OwnerDetailsComponent } from './owner-details/owner-details.component';

@NgModule({
  imports: [
    CommonModule,
    CreateOwnerRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    // Core
    ListModule,
    OwnerCreateUpdateModule,
    BreadcrumbsModule
  ],
  declarations: [CreateOwnerComponent, OwnerDetailsComponent],
  exports: [CreateOwnerComponent]
})
export class CreateOwnerModule {
}
