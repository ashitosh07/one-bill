import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShowErrorsComponent } from './show-errors.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [ShowErrorsComponent],
    entryComponents: [ShowErrorsComponent],
    exports: [ShowErrorsComponent]
})
export class ShowErrorsModule {
}