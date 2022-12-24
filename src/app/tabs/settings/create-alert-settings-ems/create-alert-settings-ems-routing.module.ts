import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateAlertSettingsEMSComponent } from "./create-alert-settings-ems.component";
const routes: Routes = [
    {
      path: '',
      component: CreateAlertSettingsEMSComponent
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class CreateAlertSettingsEMSRoutingModule{

}