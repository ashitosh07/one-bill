import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatUiRoutingModule } from './chat-ui-routing.module';
import { ChatUiComponent } from './chat-ui.component';
import { ScrollbarModule } from 'src/@fury/shared/scrollbar/scrollbar.module';
import { MaterialModule } from 'src/@fury/shared/material-components.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [ChatUiComponent],
  imports: [
    CommonModule,
    ChatUiRoutingModule,
    ReactiveFormsModule,
    MaterialModule,

    // Core
    ScrollbarModule,
  ]
})
export class ChatUiModule { }
