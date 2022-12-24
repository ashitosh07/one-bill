import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Billtag } from '../create-billtag/billtag.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MetadataService } from '../../../../app/tabs/shared/services/metadata.service';
import { Observable, ReplaySubject } from 'rxjs';
import { MetadataBillSettings } from 'src/app/tabs/shared/models/metadata.bill-settings.model';
import { ClientService } from 'src/app/tabs/shared/services/client.service';
import { BilltagService } from "src/app/tabs/shared/services/billtag.service";
import { Metadata } from '../../shared/models/metadata.model';
import { Client } from 'src/app/pages/client/client-create-update/client.model';
import { ListItem } from '../../shared/models/list-item.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { BillPeriodService } from '../../shared/services/billperiod.service';
import { Master } from '../../shared/models/master.model';



@Component({
  selector: 'create-billtag',
  templateUrl: './create-billtag.component.html',
  styleUrls: ['./create-billtag.component.scss'],
  animations: [fadeInRightAnimation, fadeInUpAnimation]
})
export class CreateBilltagComponent implements OnInit {

  static id=0;
  form:FormGroup;
    
  public defaults: Billtag;

  metadataBillSettingsTypes: Master[];
 
  metadata: Metadata; 
  
  clients: ListItem[] = [];
  constructor(private fb: FormBuilder, private metadataService: MetadataService,
    private clientService: ClientService,private billTagService:BilltagService,
    private snackbar:MatSnackBar, private billPeriodService: BillPeriodService) { }

  ngOnInit() {
    
    this.defaults = new Billtag({});
    
    // this.metadataService.invokeMetadata();    
    // this.metadata = this.metadataService.getMetadata();    
    // this.metadataBillSettingsTypes = this.metadata.billSettings;

    // this.billPeriodService.getBillSettings().subscribe((data: Master[]) => {
    //   if(data) {
    //     this.metadataBillSettingsTypes = data;
    //     } 
    //   })

    this.getClients();
    
    this.form=this.fb.group({
      id:[this.defaults.id || CreateBilltagComponent.id++],
      billSettingsId: [this.defaults.billSettingsId || '', Validators.required],
      billSettingsName: [this.defaults.billSettingsName || '', Validators.required],
      clientId:[this.defaults.clientId || '',Validators.required],
      clientName:[this.defaults.clientName || '',Validators.required]
      
      
    })
  }

  getClients() 
  {
    this.clients = [];
    this.clientService.getClients().subscribe((clients: Client[]) => {
        if (clients) 
        {
          
          clients.forEach(client => {
            this.clients.push({ label: client.clientName, value: client.id } as ListItem);
          }); 
         
        }
        
    });
    
  }

  

  save()
  {
      this.createBillTag();
  }

  createBillTag()
  {
    
    Object.assign(this.defaults,this.form.value);
        
    this.billTagService.createBilltag(this.defaults).
      subscribe((billtag:Billtag)=>{
        this.snackbar.open('created Bill tags Successfully',null,{
          duration:5000,
          verticalPosition:'top',
          horizontalPosition:'center',
          panelClass:['green-snackbar'],
        });
      })
    
  }
  
  selectBillSettings (event) 
  {
    this.metadataBillSettingsTypes.forEach(settings => {
      if(event.option.value == settings.description) 
      {
        this.form.controls.billSettingsId.setValue(settings.id);
      }
    })
  }

  selectClients (event) 
  {
    this.clients.forEach(client => {
      if(event.option.value == client.label) 
      {
        this.form.controls.clientId.setValue(client.value);
      }
        
    })
  }

}
