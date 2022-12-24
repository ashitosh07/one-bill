import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../../../src/@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../../../src/@fury/fury-shared.module';
import { ListModule } from '../../../../../../src/@fury/shared/list/list.module';
import { MatTableModule } from '@angular/material/table';
import { NotificationsSendDialogComponent } from './notifications-send-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MaterialModule,
        FurySharedModule,
        ListModule,
        MatTableModule
    ],
    declarations: [NotificationsSendDialogComponent],
    entryComponents: [NotificationsSendDialogComponent],
    exports: [NotificationsSendDialogComponent]
})
export class NotificationsSendDialogModule { }