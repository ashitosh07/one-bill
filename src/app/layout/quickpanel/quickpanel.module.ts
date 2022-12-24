import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { ScrollbarModule } from '../../../@fury/shared/scrollbar/scrollbar.module';
import { QuickpanelComponent } from './quickpanel.component';
import { FormElementsModule } from '../../pages/forms/form-elements/form-elements.module'
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { UserMasterModule } from '../../tabs/shared/components/create-user-master/create-user-master.module';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    ScrollbarModule,
    UserMasterModule,
    ReactiveFormsModule
  ],
  declarations: [QuickpanelComponent],
  exports: [QuickpanelComponent]
})
export class QuickpanelModule {
}
