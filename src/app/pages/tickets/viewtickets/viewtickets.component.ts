import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MailLabel } from '../../apps/inbox/shared/mail-label.interface';
import { Mail } from '../../apps/inbox/shared/mail.interface';
import { EditorComponent } from '../viewtickets/editor/editor.component';
import { TicketlistService } from '../ticketlist.service';
import { ImageViewComponent } from './image-view/image-view.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RepositionScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-viewtickets',
  templateUrl: './viewtickets.component.html',
  styleUrls: ['./viewtickets.component.scss']
})
export class ViewticketsComponent implements OnInit {


  fileName: string = '';
  ticketId: string;
  dctData = {
  };

  comments: string = '';
  blnShow: boolean = false;

  host_path: string;
  baseUrl: string;

  showModal: boolean = false;
  currentImage: string;







  id: number | string;
  mail$: Observable<Mail>;
  availableLabels: MailLabel[];
  private _mail: Mail;

  replying: boolean;
  items;

  tempDate;


  constructor(private route: ActivatedRoute,
    private ticketService: TicketlistService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private envService: EnvService) {
    this.baseUrl = envService.backendForFiles;
  }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      // PARAMS CHANGED ...
      this.host_path = this.baseUrl + '/uploads/';
      this.ticketId = this.route.snapshot.paramMap.get("id");
      this.getData();

    });

  }
  getData() {
    this.ticketService.getTicketById(this.ticketId).subscribe((data: any) => {
      if (data) {

        this.dctData = data;
        if (this.dctData['image'] == '' || this.dctData['image'] == null) {
          this.dctData['image'] = 'assets/img/avatars/one.png';
        }
        else {
          this.dctData['image'] = this.baseUrl + '/uploads/' + this.dctData['image'];
        }
        this.dctData['type'] = 'image';

        let attachment = this.dctData['attachment'];
        if (attachment) {
          var ext = attachment.substring(attachment.lastIndexOf('.') + 1);
          if (ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg') {
            this.dctData['type'] = 'image';

          }
          else {
            this.dctData['type'] = 'pdf';
          }
          let index = attachment.indexOf(',');
          if (index > -1) {
            this.dctData['fileName'] = attachment.substring(index + 1);
            this.dctData['attachmentFile'] = attachment.substring(0, index);
          }
        }

        this.dctData['ticketTransaction'].forEach(element => {
          if (element['image'] == '' || element['image'] == null) {
            element['image'] = 'assets/img/avatars/one.png';
          }
          else {
            element['image'] = this.baseUrl + '/uploads/' + element['image'];
          }
          element['type'] = 'image';
          let attachment = element['attachment'];
          if (attachment) {
            var ext = attachment.substring(attachment.lastIndexOf('.') + 1);
            if (ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg') {
              element['type'] = 'image';
            }
            else {
              element['type'] = 'pdf';
            }
            let index = attachment.indexOf(',');
            if (index > -1) {
              element['fileName'] = attachment.substring(index + 1);
              element['attachmentFile'] = attachment.substring(0, index);
            }
          }
        });
      }
    });
  }

  showPopupData() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.height = "610px";
    dialogConfig.data = { ticketData: this.dctData }

    this.dialog.open(EditorComponent, dialogConfig).afterClosed().subscribe((data) => { this.getData() });
    this.getData();
  }

  ImageClick(image) {

    let type = 'image';

    if (image) {
      var ext = image.substring(image.lastIndexOf('.') + 1);
      if (ext.toLowerCase() == 'png' || ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg') {
        type = 'image';
      }
      else {
        type = 'pdf';
      }
    }

    this.currentImage = image;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    if (type == 'pdf') {
      dialogConfig.height = "560px";
      dialogConfig.width = "650px";
    }
    else {
      dialogConfig.height = "430px";
      dialogConfig.width = "550px";
    }

    dialogConfig.panelClass = 'custom-modalbox';
    dialogConfig.data = {
      currentImage: this.currentImage,
      type: type
    }

    this.dialog.open(ImageViewComponent, dialogConfig);
  }



































  toggleStarred() {
    this.ticketService.toggleStarred(this._mail);
  }

  addLabel(label: MailLabel) {
    this.ticketService.addLabel(label, this._mail);
  }

  removeLabel(label: MailLabel) {
    this.ticketService.removeLabel(label, this._mail);
  }

  showReply() {
    this.replying = true;
  }

  hideReply(send?: boolean) {
    this.replying = false;

    if (send) {
      this.snackbar.open(`You replied to ${this._mail.from.name}`, 'UNDO', {
        duration: 3000
      });
    }
  }

}
