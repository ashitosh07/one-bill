import { Component, OnInit , Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'fury-toolbar-quickpanel-main-toggle',
  templateUrl: './toolbar-quickpanel-main-toggle.component.html',
  styleUrls: ['./toolbar-quickpanel-main-toggle.component.scss']
})
export class ToolbarQuickpanelMainToggleComponent implements OnInit {

  @Output() openQuickPanel = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
