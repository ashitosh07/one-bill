import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationLogsComponent } from './notification-logs.component';


const routes: Routes = [
  {
    path: '',
    component: NotificationLogsComponent

  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationLogsRoutingModule {
}
