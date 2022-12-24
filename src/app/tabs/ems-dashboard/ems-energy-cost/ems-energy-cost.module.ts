import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EmsEnergyCostRoutingModule } from './ems-energy-cost-routing.module';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FuryCardModule } from '../../../../@fury/shared/card/card.module';
import { MaterialModule } from '../../../../@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../@fury/fury-shared.module';
import { HighlightModule } from '../../../../@fury/shared/highlightjs/highlight.module';
import { BreadcrumbsModule } from '../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../../@fury/shared/list/list.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { EmsEnergyCostComponent } from '../ems-energy-cost/ems-energy-cost.component';
import { EnergyCostTileComponent } from '../energy-cost-tile/energy-cost-tile.component';

@NgModule({
  declarations: [EmsEnergyCostComponent, EnergyCostTileComponent],
  imports: [
    CommonModule,
    EmsEnergyCostRoutingModule,
    //FlexLayoutModule,MatButtonModule,MatDividerModule,MatCardModule,MatOptionModule,MatSelectModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,
    ReactiveFormsModule,
    HighlightModule,
    FuryCardModule,
    ListModule,
    BreadcrumbsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule
  ],
//  exports: [EnergyCostTileComponent],
  providers: [DatePipe, DecimalPipe]
})
export class EmsEnergyCostModule { 
  
  
}
