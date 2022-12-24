import { NgModule } from '@angular/core';
import { NoCommaPipe } from './no-comma-pipe';

@NgModule({
  imports: [],
  declarations: [NoCommaPipe],
  exports: [NoCommaPipe]
})
export class PipesModule { }