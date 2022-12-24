import { CommonModule } from '@angular/common';
import { ExpandableTableStructureComponent } from './expandable-table-structure.component';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../../../src/@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../../../src/@fury/fury-shared.module';
import { ListModule } from '../../../../../../src/@fury/shared/list/list.module';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        FurySharedModule,
        ListModule,
        MatTableModule
    ],
    declarations: [ExpandableTableStructureComponent],
    entryComponents: [ExpandableTableStructureComponent],
    exports: [ExpandableTableStructureComponent]
})
export class ExpandableTableStructureModule { }
