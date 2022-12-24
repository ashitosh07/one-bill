import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomValidationErrorsComponent } from '../custom-validation-errors/custom-validation-errors.component';


@NgModule({
  declarations: [ CustomValidationErrorsComponent ],
  imports: [
    CommonModule
  ],
  exports: [ CustomValidationErrorsComponent ]
})
export class CustomValidationModule { }
