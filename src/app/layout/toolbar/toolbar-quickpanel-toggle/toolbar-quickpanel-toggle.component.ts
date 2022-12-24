import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'fury-toolbar-quickpanel-toggle',
  templateUrl: './toolbar-quickpanel-toggle.component.html',
  styleUrls: ['./toolbar-quickpanel-toggle.component.scss']
})
export class ToolbarQuickpanelToggleComponent {

  selected = 'Option';
  input: string;
  focused: boolean;

  @Output() openQuickPanel = new EventEmitter();

  constructor() {
  }

  openDropdown() {
    this.focused = true;
  }

  closeDropdown() {
    this.focused = false;
  }
}
