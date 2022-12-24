import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateBenchmarkSettingsComponent } from './create-benchmark-settings.component';

const routes: Routes = [
    {
      path: '',
      component: CreateBenchmarkSettingsComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class CreateBenchmarkSettingsRoutingModule{

}