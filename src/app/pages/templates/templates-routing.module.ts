import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SmstemplateComponent } from './smstemplate/smstemplate.component';
import { EditorComponent } from './editor/editor.component';
import { AlertSettingsComponent } from './alert-settings/alert-settings.component';

const routes: Routes = [
  {
    path:'smstemplate',
    component:SmstemplateComponent
  },
  {
    path:'emailtemplate',
    component:EditorComponent
  },
  {
    path:'alert/settings',
    component:AlertSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
