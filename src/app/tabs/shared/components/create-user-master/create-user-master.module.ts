import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../../../src/@fury/shared/material-components.module';
import { FurySharedModule } from '../../../../../../src/@fury/fury-shared.module';
import { ListModule } from '../../../../../../src/@fury/shared/list/list.module';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CreateUserMasterComponent } from './create-user-master.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BreadcrumbsModule } from '../../../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ShowErrorsModule } from '../../../shared/components/show-errors/show-errors.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TitleModule } from '../../../../../@fury/shared/title/title.module';
import { PageLayoutModule } from '../../../../../@fury/shared/page-layout/page-layout.module';
import {FuryCardModule } from '../../../../../@fury/shared/card/card.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BreadcrumbsModule,
        ShowErrorsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        FontAwesomeModule,
        TitleModule,
        PageLayoutModule,
        FuryCardModule,
        MaterialModule,
        FurySharedModule,
        ListModule, MatToolbarModule,
        MatTableModule,
        FlexLayoutModule
    ],
    declarations: [CreateUserMasterComponent],
    entryComponents: [CreateUserMasterComponent],
    exports: [CreateUserMasterComponent]
})
export class UserMasterModule { }