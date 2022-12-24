import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BulkImportRoutingModule } from './bulk-import-routing.module';
import { BulkImportComponent } from './bulk-import.component';

import {FuryCardModule } from 'src/@fury/shared/card/card.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { TableStructureModule} from '../shared/components/table-structure/table-structure.module'
import { BreadcrumbsModule } from 'src/@fury/shared/breadcrumbs/breadcrumbs.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [BulkImportComponent],
  imports: [
    CommonModule,
    BulkImportRoutingModule,
    FuryCardModule,
    FurySharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatSelectModule,
    MaterialModule,
    TableStructureModule,
    BreadcrumbsModule
  ],
  exports: [BulkImportComponent]
})
export class BulkImportModule { }
