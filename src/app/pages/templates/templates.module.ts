import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { TemplatesRoutingModule } from './templates-routing.module';
import { SmstemplateComponent } from './smstemplate/smstemplate.component';
import { QuillModule } from 'ngx-quill';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FurySharedModule } from '../../../@fury/fury-shared.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { MatInputModule } from '@angular/material/input';
import { EditorComponent } from './editor/editor.component';
import { ToolbarComponent } from 'src/app/layout/toolbar/toolbar.component';
import { ConstantsService } from 'src/app/tabs/shared/services/constants.service';
import { AlertSettingsComponent } from './alert-settings/alert-settings.component';
import { AlertSettingsToolbarComponent } from './alert-settings/alert-settings-toolbar/alert-settings-toolbar.component';
import { TableStructureModule } from 'src/app/tabs/shared/components/table-structure/table-structure.module';
import { CopyNotificationTemplateComponent } from './copy-notification-template/copy-notification-template.component';

@NgModule({
  declarations: [SmstemplateComponent, EditorComponent, AlertSettingsComponent, AlertSettingsToolbarComponent, CopyNotificationTemplateComponent],
  imports: [
    ListModule,
    CommonModule,
    TemplatesRoutingModule,
    QuillModule.forRoot(),
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    FurySharedModule,
    MaterialModule,
    MatInputModule,
    TableStructureModule
  ],
  // providers: [ToolbarComponent,ConstantsService]
})
export class TemplatesModule { }
