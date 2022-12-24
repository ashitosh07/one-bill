import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTaxSettingsComponent } from './create-tax-settings.component';

const routes: Routes = [
  {
    path: '',
    component: CreateTaxSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CreateTaxSettingsRoutingModule {
}
