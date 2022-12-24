import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsModule } from '../../../@fury/shared/breadcrumbs/breadcrumbs.module';
import { ListModule } from '../../../@fury/shared/list/list.module';
import { MaterialModule } from '../../../@fury/shared/material-components.module';
import { CreateAnnouncementRoutingModule } from './create-announcement-routing.module';
import { CreateAnnouncementComponent } from './create-announcement.component';
import { AnnouncementCreateUpdateModule } from './announcement-create-update/announcement-create-update.module';
import { FurySharedModule } from '../../../@fury/fury-shared.module';

@NgModule({
  imports: [
    CommonModule,
    CreateAnnouncementRoutingModule,
    FormsModule,
    MaterialModule,
    FurySharedModule,

    // Core
    ListModule,
    AnnouncementCreateUpdateModule,
    BreadcrumbsModule
  ],
  declarations: [CreateAnnouncementComponent],
  exports: [CreateAnnouncementComponent]
})
export class CreateAnnouncementModule {
}
