import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FurySharedModule } from 'src/@fury/fury-shared.module';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { UserConfirmationPopupComponent } from '../../components/user-confirmation-popup/user-confirmation-popup.component'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FurySharedModule,
        MaterialModule
    ],
    declarations: [UserConfirmationPopupComponent],
    entryComponents: [UserConfirmationPopupComponent],
    exports: [UserConfirmationPopupComponent]
})
export class UserConfirmationModule { }
