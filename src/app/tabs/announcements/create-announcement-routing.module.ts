import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateAnnouncementComponent } from './create-announcement.component';

const routes: Routes = [
  {
    path: '',
    component: CreateAnnouncementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateAnnouncementRoutingModule {
}
