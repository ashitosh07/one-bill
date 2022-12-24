import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileService } from 'src/app/tabs/shared/services/file.service';
import { environment } from '../../../../environments/environment';
import { OwnerService } from 'src/app/tabs/shared/services/owner.service';
import { Tenant } from 'src/app/tabs/shared/models/tenant.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from 'src/app/tabs/shared/services/authentication.service';
import { UserDetails } from 'src/app/tabs/shared/models/user-details';
import { ResetPassword } from 'src/app/tabs/shared/models/reset-password.model';
import { CookieService } from 'ngx-cookie-service';
import { LoginReportService } from 'src/app/tabs/shared/services/login-report.service';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit {

  public groupForm: FormGroup;
  public groupPassword: FormGroup;
  fileSize = 0;

  @ViewChild('profilePic') profilePic: ElementRef;

  baseUrl = '';

  attachment = '';
  image;

  userName = '';
  email;
  firstName = '';
  lastName = '';
  role: string = '';
  newPassword;
  confirmPassword;

  bio;
  isUploadSuccess: boolean = true;
  errorMessage: string = '';

  newPasswordInputType = 'password';
  newPasswordVisible = false;

  confirmPasswordInputType = 'password';
  confirmPasswordVisible = false;

  userId: string = this.cookieService.get('userId');

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private ownerService: OwnerService,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private loginReportService: LoginReportService,
    private envService: EnvService
  ) {
    this.baseUrl = envService.backendForFiles;
    this.fileSize = Math.floor(envService.MaxBytes/1000000);
  }

  ngOnInit(): void {
    
    if (this.userId) {
      this.getUserDeatils(this.userId);
    }

    this.groupForm = this.fb.group({
      profileFile: [null, Validators.compose([Validators.required])],
      username: [null, Validators.compose([Validators.required])],
      email: [null, Validators.compose([Validators.required])],
      firstname: [null, Validators.compose([Validators.required])],
      lastname: [null, Validators.compose([Validators.required])],
      role: [null, Validators.compose([Validators.required])]
    });
    
    this.groupForm.controls['username'].disable();
    this.groupForm.controls['email'].disable();
    this.groupForm.controls['role'].disable();
    this.groupForm.controls['firstname'].disable();
    this.groupForm.controls['lastname'].disable();

    this.groupPassword = this.fb.group({
      newPassword: [null, Validators.compose([Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&].{8,}')
      ]),
      ],
      confirmPassword: [null, Validators.compose([Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&].{8,}')
      ])
      ]
    });
    this.image = 'assets/img/avatars/two.png';
  }


  uploadPhoto() {
    var nativeElement: HTMLInputElement = this.profilePic.nativeElement;
    this.isUploadSuccess = false;
    this.errorMessage = "";
    this.image = 'assets/img/avatars/two.png';
    let file = nativeElement.files[0]['name'];
    var ext = file.substring(file.lastIndexOf('.') + 1);

    this.fileService.upload(nativeElement.files[0], "image")
      .subscribe({
        next: (image) => {
          this.attachment = image;
          this.image = this.baseUrl + "/uploads/" + this.attachment;
          this.isUploadSuccess = true;
        },
        error: (err) => {
          this.isUploadSuccess = false;
          this.errorMessage = err["error"].message == undefined ? err["error"].Message : err["error"].message;
          if(this.errorMessage == 'Request body too large.')
          {
            this.errorMessage = "Max. allowed File size is " + this.fileSize + "MB. Please upload file with smaller size.";
          } 
          //this.notificationMessage(err["error"].message, 'red-snackbar');
          // 'File upload failed. Please check the File Format and Size.'
        }
      });
  }

  saveData() {
    const userDetails: UserDetails = {
      id: this.userId,
      email: this.email,
      username: this.userName,
      image: this.attachment,
      role: this.role
    };
    this.authenticationService.updateUserDetailInformation(userDetails).subscribe({
      next: (data: any) => {
        if (data.status === 'Success') {
          this.notificationMessage('User information updated successfully', 'green-snackbar');
          if (this.attachment) {
            this.loginReportService.setIsProfiledUser(this.attachment);
          }
        } else {
          this.notificationMessage('User information updation failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('User information updation failed', 'red-snackbar');
      }
    });
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.notificationMessage('User password does not  match', 'red-snackbar');
      return;
    }
    const userDetails: ResetPassword = {
      id: this.userId,
      userName: this.userName,
      email: this.email,
      token: '',
      password: this.confirmPassword
    };
    this.authenticationService.updateUserPassword(userDetails).subscribe({
      next: (data: any) => {
        if (data.status === 'Success') {
          this.notificationMessage('User password reset successfully', 'green-snackbar');
        } else {
          this.notificationMessage('User password reset failed', 'red-snackbar');
        }
      },
      error: (err) => {
        this.notificationMessage('User password reset failed', 'red-snackbar');
      }
    });
  }

  getUserDeatils(userId: string) {
    this.ownerService.getUserDeatils(userId).subscribe({
      next: (response: Tenant) => {
        if (response) {
          if (response.photo == '') {
            this.image = 'assets/img/avatars/two.png';
          }
          else {
            this.image = this.baseUrl + '/uploads/' + response.photo;
          }

          this.firstName = response.firstName;
          this.lastName = response.lastName;
          this.userName = response.accountNumber;
          this.email = response.email;
          this.role = response.role;
        } else {
          this.image = '';
          this.firstName = '';
          this.lastName = '';
          this.userName = '';
          this.email = '';
          this.role = '';
        }
      },
      error: (err) => {
        this.notificationMessage('user details not found', 'red-snackbar');
      }
    });
  }

  notificationMessage(message: string, cssClass: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'end',
      panelClass: [cssClass],
    });
  }

  toggleNewPasswordVisibility() {
    if (this.newPasswordVisible) {
      this.newPasswordInputType = 'password';
      this.newPasswordVisible = false;
      this.cd.markForCheck();
    } else {
      this.newPasswordInputType = 'text';
      this.newPasswordVisible = true;
      this.cd.markForCheck();
    }
  }

  toggleConfirmPasswordVisibility() {
    if (this.confirmPasswordVisible) {
      this.confirmPasswordInputType = 'password';
      this.confirmPasswordVisible = false;
      this.cd.markForCheck();
    } else {
      this.confirmPasswordInputType = 'text';
      this.confirmPasswordVisible = true;
      this.cd.markForCheck();
    }
  }

}
