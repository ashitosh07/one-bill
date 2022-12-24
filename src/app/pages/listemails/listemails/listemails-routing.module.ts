import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListemailsComponent } from './listemails.component';
import { InboxMailListComponent } from './inbox-mail-list/inbox-mail-list.component';
import { InboxMailComponent } from './inbox-mail/inbox-mail.component';

const routes: Routes = [
  {
    path:'',
    component:ListemailsComponent,
    children: [
      {
        path: '',
        redirectTo: 'primary',
        pathMatch: 'full',
        data: {
          scrollDisabled: true
        }
      },
      {
        path: ':category',
        component: InboxMailListComponent,
        data: {
          scrollDisabled: true
        }
      },
      {
        path: 'mail/:id',
        component: InboxMailComponent,
        data: {
          scrollDisabled: true
        }
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListemailsRoutingModule { }
