import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollbarModule } from '../../../../@fury/shared/scrollbar/scrollbar.module';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TicketlistRoutingModule } from './ticketlist-routing.module';

import { TicketlistComponent } from './ticketlist.component';
import { ViewticketsComponent } from '../viewtickets/viewtickets.component';
import { ImageViewComponent } from '../viewtickets/image-view/image-view.component';
import { EditorComponent } from '../viewtickets/editor/editor.component';
import { CreateComponent } from '../createticket/create/create.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatDialogModule } from '@angular/material/dialog';
import { FurySharedModule } from '../../../../../src/@fury/fury-shared.module';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QuillModule } from 'ngx-quill';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { BreadcrumbsModule } from '../../../../../src/@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../../src/@fury/shared/list/list.module';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [TicketlistComponent,ViewticketsComponent,EditorComponent, ImageViewComponent,CreateComponent],
  imports: [
    CommonModule,
    TicketlistRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    ScrollbarModule,
    ScrollingModule,

    MatCardModule,
    FlexLayoutModule,
    MatDialogModule,
    QuillModule.forRoot(),

    CommonModule,
    FurySharedModule,
    ReactiveFormsModule,

    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
  

    MatDialogModule,
    PdfViewerModule,

   
    ListModule,
    BreadcrumbsModule,
    CommonModule,
    QuillModule.forRoot(),
    ReactiveFormsModule,


    MatDialogModule,
    MatToolbarModule
  ],
  exports: [TicketlistComponent],
  entryComponents: [EditorComponent,ImageViewComponent]
})
export class TicketlistModule { }
