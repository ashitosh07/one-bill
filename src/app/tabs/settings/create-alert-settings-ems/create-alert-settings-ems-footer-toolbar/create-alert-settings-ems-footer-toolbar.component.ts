import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-create-alert-settings-ems-footer-toolbar',
  templateUrl: './create-alert-settings-ems-footer-toolbar.component.html',
  styleUrls: ['./create-alert-settings-ems-footer-toolbar.component.scss']
})
export class CreateAlertSettingsEMSFooterToolbarComponent implements OnInit {

  @Output() saveClicked = new EventEmitter();
  

  constructor() { }

  ngOnInit(): void {
  }

  onSave() {
    this.saveClicked.emit();
  }

  
}
