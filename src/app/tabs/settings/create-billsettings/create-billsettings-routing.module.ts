import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBillsettingsComponent } from '../create-billsettings/create-billsettings.component';

const routes: Routes = [
    {
      path: '',
      component: CreateBillsettingsComponent
    }
  ];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class CreateBillsettingsRoutingModule {

}