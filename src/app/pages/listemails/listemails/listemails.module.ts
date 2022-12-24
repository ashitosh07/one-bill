import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListemailsRoutingModule } from './listemails-routing.module';
import { ListemailsComponent } from './listemails.component';
import { ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { ScrollbarModule } from '../../../../@fury/shared/scrollbar/scrollbar.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { InboxNavigationComponent } from './inbox-navigation/inbox-navigation.component';
import { InboxMailListComponent } from './inbox-mail-list/inbox-mail-list.component';
import { InboxMailComponent } from './inbox-mail/inbox-mail.component';
import { InboxMailLabelComponent } from './inbox-mail-label/inbox-mail-label.component';
import { InboxMailStarComponent } from './inbox-mail-star/inbox-mail-star.component';
import { InboxMailLabelListComponent } from './inbox-mail-label-list/inbox-mail-label-list.component';
import { InboxMailConfirmDialogComponent } from './inbox-mail-confirm-dialog/inbox-mail-confirm-dialog.component';
import { SendemailComponent } from '../../sendsms/sendemail/sendemail.component';
import { ListFilterPipe } from './list-filter.pipe';
import {MatIconModule} from '@angular/material/icon';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

@NgModule({
  declarations: [ListFilterPipe,ListemailsComponent, InboxNavigationComponent, InboxMailListComponent, InboxMailComponent, InboxMailLabelComponent, InboxMailStarComponent, InboxMailLabelListComponent, InboxMailConfirmDialogComponent],
  imports: [
    CommonModule,
    ListemailsRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    QuillModule.forRoot(),
    ScrollbarModule,
    ScrollingModule,
    Ng2SearchPipeModule,
    MatIconModule
  ],
  entryComponents: [InboxMailConfirmDialogComponent, SendemailComponent],
  providers:[InboxMailListComponent,ListFilterPipe, InboxMailComponent ]

})
export class ListemailsModule { }
