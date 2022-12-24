import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserAcceptanceFiles } from '../shared/models/user-acceptance-files.model';
import { MenuItemService } from '../shared/services/menu-item.service';
import { UserFileAcceptanceLog } from '../shared/models/user-file-acceptance-log.model';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fury-login-credentials',
  templateUrl: './login-credentials.component.html',
  styleUrls: ['./login-credentials.component.scss']
})
export class LoginCredentialsComponent implements OnInit {

  popupVar: string;
  host_path: string;
  baseUrl: string;
  fileName: string = '';

  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<LoginCredentialsComponent>,
    @Inject(MAT_DIALOG_DATA) private data: UserAcceptanceFiles,
    private menuItemService: MenuItemService,
    private cookieService: CookieService
  ) {
    dialogRef.disableClose = true;
    this.fileName = data.fileName;
  }

  ngOnInit(): void {
  }

  decline() {
    this.dialogRef.close();
    this.router.navigate(['/login']);
  }

  accept() {
    const userFileAcceptanceLog: UserFileAcceptanceLog = {
      userId: this.cookieService.get("userId"),
      isAccepted: true,
      userAcceptanceFileId: this.data.id
    };
    this.menuItemService.createUserAcceptanceLog(userFileAcceptanceLog).subscribe({
      next: (data: boolean) => {
        this.dialogRef.close();
      },
      error: () => {
        this.dialogRef.close();
      }
    });
  }
}
