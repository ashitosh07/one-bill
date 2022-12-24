import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FuryCardModule } from '../../../../../@fury/shared/card/card.module';
import { ListModule } from '../../../../../@fury/shared/list/list.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { VariablepayCreateUpdateComponent } from './variablepay-create-update.component';
import { MaterialModule } from '../../../../../@fury/shared/material-components.module';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { DirectivesModule } from '../../../shared/custom-directives/custom-directives.module';
import { PipesModule } from '../../../shared/custom-pipes/pipes-module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FuryCardModule,
    ListModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    ShowErrorsModule,
    DirectivesModule,
    PipesModule
  ],
  declarations: [VariablepayCreateUpdateComponent],
  entryComponents: [VariablepayCreateUpdateComponent],
  exports: [VariablepayCreateUpdateComponent]
})
export class VariablePayCreateUpdateModule {
}
