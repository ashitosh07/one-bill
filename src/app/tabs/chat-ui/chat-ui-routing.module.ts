import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatUiComponent } from './chat-ui.component';

const routes: Routes = [{
  path:'',
  component:ChatUiComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatUiRoutingModule { }
