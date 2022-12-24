import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { EnvService } from 'src/app/env.service';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'fury-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss']
})
export class ImageViewComponent implements OnInit {

  currentImage: string;
  type: string;
  host_path: string;
  baseUrl: string;
  popupVar: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private envService: EnvService
  ) {
    this.baseUrl = envService.backendForFiles;
    this.currentImage = data.currentImage;
    this.type = data.type;
  }

  ngOnInit(): void {

    this.host_path = this.baseUrl + '/uploads/';
    this.popupVar = this.host_path + this.currentImage;
  }

  downloadPdf() {

    FileSaver.saveAs(this.popupVar, this.currentImage);
  }

}
