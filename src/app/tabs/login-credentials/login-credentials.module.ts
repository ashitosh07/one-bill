import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginCredentialsRoutingModule } from './login-credentials-routing.module';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { LoginCredentialsComponent } from './login-credentials.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';


@NgModule({
  declarations: [LoginCredentialsComponent],
  imports: [
    CommonModule,
    LoginCredentialsRoutingModule,
    PdfViewerModule ,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ]
})
export class LoginCredentialsModule { }
