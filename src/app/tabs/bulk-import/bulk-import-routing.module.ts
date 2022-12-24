import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BulkImportComponent } from './bulk-import.component';

const routes: Routes = [ {
  path: '',
  component: BulkImportComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BulkImportRoutingModule { }
