import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FurySharedModule } from 'src/@fury/fury-shared.module';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { CancelConfirmationDialogComponent } from '../../components/cancel-confirmation-dialog/cancel-confirmation-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FurySharedModule,
        MaterialModule
    ],
    declarations: [CancelConfirmationDialogComponent],
    entryComponents: [CancelConfirmationDialogComponent],
    exports: [CancelConfirmationDialogComponent]
})
export class CancelConfirmationDialogModule { }
