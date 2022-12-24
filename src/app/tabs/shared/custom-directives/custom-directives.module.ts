import { NgModule } from '@angular/core';
import { ValidateDecimalPlacesDirective } from './validate-decimal-places-directive.directive';
import { ValidateNumericOnlyDirective } from './validate-numeric-only-directive';

@NgModule({
  imports: [],
  declarations: [ValidateDecimalPlacesDirective, ValidateNumericOnlyDirective],
  exports: [ValidateDecimalPlacesDirective, ValidateNumericOnlyDirective]
})
export class DirectivesModule { }