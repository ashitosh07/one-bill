import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ParameterChartService } from '../shared/services/parameter-chart.service';
import { environment } from 'src/environments/environment';
import { Master } from '../shared/models/master.model';
import { SLDMaster } from '../shared/models/sld-master.model';
import { SLDTransaction } from '../shared/models/sld-transaction.model';
import { EstidamaChartService } from '../estidama-chart/estidama-chart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TemplatesService } from 'src/app/pages/templates/templates.service';
import { FileService } from '../shared/services/file.service';
import { MasterService } from '../shared/services/master.service';
import { CookieService } from 'ngx-cookie-service';
import { MeterReplacementService } from '../shared/services/meterreplacement.service';
import { getClientDataFormat } from '../shared/utilities/utility';
import { CreateUserMasterComponent } from '../../tabs/shared/components/create-user-master/create-user-master.component';
import { MatDialog } from '@angular/material/dialog';
import { EnvService } from 'src/app/env.service';

@Component({
  selector: 'fury-single-line-diagram',
  templateUrl: './single-line-diagram.component.html',
  styleUrls: ['./single-line-diagram.component.scss']
})
export class SingleLineDiagramComponent implements OnInit {

  clientId: number = 0;
  meters: Master[] = [];
  filtermeters: Master[] = [];
  meterId: number;
  meterName: string = '';
  parameters: Master[] = [];
  parameterId: number;
  parameterName: string = '';
  meterTypes: Master[] = [];
  meterTypeId: number;
  meterGroupList: any = [];
  meterGroup: number = null;
  lstMeterGroup: any = [];
  dateFormat = '';
  pointSize = 7;
  element: Element;
  root: Element;
  floors: Master[] = [];
  floorId: number;
  ctx;
  canvas;
  sldMaster: SLDMaster = {};
  sldTransactions: SLDTransaction[] = [];
  @ViewChild('profilePic') profilePic: ElementRef;
  attachment = '';
  image = '';
  baseUrl = '';
  client: number = 0;
  clients: Master[] = [];

  constructor(
    private parameterChartService: ParameterChartService,
    private estidamaChartService: EstidamaChartService,
    private templateService: TemplatesService,
    private snackbar: MatSnackBar,
    private fileService: FileService,
    private masterService: MasterService,
    private meterReplacementService: MeterReplacementService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private envService: EnvService
  ) {
    this.baseUrl = envService.backendForFiles;
    this.dateFormat = getClientDataFormat('DateFormat') ?? envService.dateFormat;;
  }

  ngOnInit(): void {

    //this.clientId = parseInt(this.cookieService.get('globalClientId'));

    this.getClients();
    //this.getMeterTypes();
    this.onMeterGroupChange();
    this.getFloors();
  }

  getClients() {
    this.clients = [];
    this.meterReplacementService.getClients().subscribe((clients: Master[]) => {
      if (clients) {
        this.clients = clients;
      }
    });
  }

  onChangeClient() {
    this.onMeterGroupChange();
  }

  getMeterTypes() {
    this.meterTypes = [];
    this.meters = [];
    this.parameters = [];
    this.estidamaChartService.getMeterTypes().subscribe((response: any) => {
      if (response) {
        const meterTypes = response['meterTypeList'];
        if (meterTypes) {
          meterTypes.forEach(element => {
            this.meterTypes.push({ id: element.meterTypeID, description: element.meterTypeName });
          });
        }
        this.meterTypeId = this.meterTypes[0].id;
        this.meterGroupList = response['meterGroupList'];
        this.onMeterTypeChange();
      }
    });
  }

  getFloors() {
    this.floors = [];
    this.masterService.getUserMasterdata(9, 0).subscribe((response: any) => {
      if (response) {
        this.floors = response;
      }
    });
  }

  onMeterTypeChange(event = null) {
    if (event) {
      this.meterTypeId = event.value;
    }
    this.meterGroupList.forEach(group => {
      if (group.meterTypeID == this.meterTypeId) {
        if (!this.lstMeterGroup.some(meterGroup => meterGroup.groupID == group.groupID)) {
          this.lstMeterGroup.push({ groupID: group.groupID, groupName: group.groupName })
        }
      }
    })

    if (this.lstMeterGroup.length > 0)
      this.meterGroup = this.lstMeterGroup[0].groupID; //Initialise group list
    this.onMeterGroupChange();
  }

  onMeterGroupChange() {
    this.meters = [];
    // this.meterGroupList.forEach(group => {
    //   if (group.meterTypeID == this.meterTypeId && group.groupID == this.meterGroup) {
    //     if (!this.meters.some(meterName => meterName.id == group.meterID)) {
    //       this.meters.push({ id: group.meterID, description: group.meterName })
    //     }
    //   }
    //   this.filtermeters = this.meters;
    // })
    if (this.clientId != 0) {
      this.meterReplacementService.getV1MeterList(this.clientId).subscribe((response: any) => {
        if (response) {
          this.meters = this.filtermeters = response;
        }
      });
    }

    this.getParameters();
  }

  onMeterChange(event) {
    this.meters.filter((item) => {
      if (item.id == event.value) {
        this.meterName = item.description;
        this.meterId = item.id;
      }
    })
  }

  onFloorChange(event) {
    this.floors.filter((item) => {
      if (item.id == event.value) {
        this.floorId = item.id;
        this.onGetSLDTransactions();
      }
    })
  }


  getParameters() {
    this.parameterChartService.getParameters(this.meterTypeId).subscribe((response: any) => {
      if (response) {
        this.parameters = response;
      }
    });
  }

  search(query: string) {
    let result = this.select(query)
    this.meters = result;
  }

  select(query: string): Master[] {
    let result: Master[] = [];
    if (query) {
      for (let a of this.filtermeters) {
        if (a.description.toLowerCase().indexOf(query) > -1) {
          result.push(a)
        }
      }
    } else {
      result = this.filtermeters;
    }
    return result
  }

  getPosition(event) {
    if (!this.meterId) {
      this.notificationMessage('Please select meter', 'red-snackbar');
      return;
    }
    const item = this.sldTransactions.find(x => x.meterId === Number(this.meterId));
    if (item) {
      this.notificationMessage('Meter already added', 'red-snackbar');
      return;
    }
    this.element = <Element>this.root;
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    let curleft = 0,
      curtop = 0;

    curleft += event.offsetX;
    curtop += event.offsetY;
    this.drawCoordinates(curleft, curtop);
  }


  drawCoordinates(x, y) {

    const grd = this.ctx.createLinearGradient(0, 0, 170, 0);
    grd.addColorStop(1, "red");
    this.ctx.fillStyle = grd; // Red color

    this.ctx.beginPath();
    this.ctx.arc(Number(x), Number(y), this.pointSize, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.fillText(this.meterName, x + 5, y);
    const coord = "x=" + x + ", y=" + y;
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);


    const pointCoordinate: SLDTransaction = {
      meterId: Number(this.meterId),
      meterName: this.meterName,
      x: Number(x),
      y: Number(y),
      clientId: Number(this.clientId),
      isDeleted: false
    };
    this.sldTransactions.push(pointCoordinate);
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
      throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  }

  uploadPhoto() {
    var nativeElement: HTMLInputElement = this.profilePic.nativeElement;
    this.fileService.upload(nativeElement.files[0])
      .subscribe(image => {
        this.attachment = image
        this.image = this.baseUrl + '/uploads/' + this.attachment
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

  clear() {
    this.sldTransactions = [];
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.image = '';
  }

  onSave() {
    if (!this.floorId) {
      this.notificationMessage('Please select floor', 'red-snackbar');
      return;
    }
    else if (this.clientId == 0) {
      this.notificationMessage('Please select Client', 'red-snackbar');
      return
    }

    if (this.sldMaster && this.sldMaster.id) {
      this.sldMaster.sldPath = this.image;
      this.sldMaster.sldTransactions = this.sldTransactions;
      this.templateService.updateSLDMaster(this.sldMaster).subscribe({
        next: response => {
          if (response) {
            this.notificationMessage('SLD Master updated successfully', 'green-snackbar');
          } else {
            this.notificationMessage('SLD Master update failed', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('SLD Master update failed', 'red-snackbar');
        }
      });
    } else {
      const sldMaster: SLDMaster = {
        masterId: this.floorId,
        clientId: this.clientId,
        sldPath: this.image,
        sldTransactions: this.sldTransactions
      };
      this.templateService.createSLDMaster(sldMaster).subscribe({
        next: response => {
          if (response) {
            this.notificationMessage('SLD Master saved successfully', 'green-snackbar');
          } else {
            this.notificationMessage('SLD Master save failed', 'red-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('SLD Master save failed', 'red-snackbar');
        }
      });
    }
  }

  onGetSLDTransactions() {
    this.sldMaster = {};
    this.sldTransactions = [];
    this.image = '';
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.templateService.getSLDMaster(this.floorId, this.clientId).subscribe({
      next: response => {
        if (response) {
          this.sldMaster = response;
          this.image = this.sldMaster.sldPath;
          this.sldTransactions = this.sldMaster.sldTransactions;
          this.sldMaster.sldTransactions.forEach(point => {
            this.bindCoordinates(point.x, point.y, point.meterName);
          })
        }
      },
      error: (err) => {
        this.sldMaster = {};
        this.sldTransactions = [];
        this.image = '';
        this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.notificationMessage('SLD Master not found', 'yellow-snackbar');
      }
    });
  }

  bindCoordinates(x, y, meterName: string) {
    this.element = <Element>this.root;
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    const grd = this.ctx.createLinearGradient(0, 0, 170, 0);
    grd.addColorStop(0, "black");
    grd.addColorStop(1, "red");
    this.ctx.fillStyle = grd; // Red color

    this.ctx.beginPath();
    this.ctx.arc(Number(x), Number(y), this.pointSize, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.fillText(meterName, x + 5, y);
    const coord = "x=" + x + ", y=" + y;
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + this.rgbToHex(p[0], p[1], p[2])).slice(-6);

  }

  createFloor() {
    let modes = [0, 9];
    this.dialog.open(CreateUserMasterComponent, { data: modes }).afterClosed().subscribe((message: any) => {
      if (message && message == 'Success') {
        this.getFloors();
      }
    });
  }
}
