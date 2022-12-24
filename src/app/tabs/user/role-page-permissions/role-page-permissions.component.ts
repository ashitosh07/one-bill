import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { fadeInUpAnimation } from 'src/@fury/animations/fade-in-up.animation';
import { fadeInRightAnimation } from 'src/@fury/animations/fade-in-right.animation';
import { scaleInAnimation } from 'src/@fury/animations/scale-in.animation';
import { MenuItemService } from '../../shared/services/menu-item.service';
import { ListColumn } from 'src/@fury/shared/list/list-column.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolePermission } from '../../shared/models/role-permission.model';
import { ListItem } from '../../shared/models/list-item.model';
import { ClientService } from '../../shared/services/client.service';
import { TableStructureComponent } from '../../shared/components/table-structure/table-structure.component';
import { SelectionModel } from '@angular/cdk/collections';
import { ClientSelectionService } from '../../shared/services/client-selection.service';


@Component({
  selector: 'app-user-page-permissions',
  templateUrl: './role-page-permissions.component.html',
  styleUrls: ['./role-page-permissions.component.scss'],
  animations: [fadeInUpAnimation, fadeInRightAnimation, scaleInAnimation]
})
export class RolePagePermissionsComponent implements OnInit {

  private _gap = 16;
  gap = `${this._gap}px`;
  col2 = `1 1 calc(50% - ${this._gap / 2}px)`;
  col3 = `1 1 calc(33.3333% - ${this._gap / 1.5}px)`;

  menuItems: any[] = [];
  selectedRows: any[] = [];
  columns: ListColumn[] = [];
  roles: ListItem[] = [];
  roleId: number;

  nameColumnName = 'Page Name';

  @ViewChild(TableStructureComponent, { static: false }) tableStructureComponent: TableStructureComponent;

  constructor(
    private menuItemService: MenuItemService,
    private ClientService: ClientService,
    private snackbar: MatSnackBar,
    private clientSelectionService: ClientSelectionService,
    private ref: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.clientSelectionService.setIsClientVisible(false);
    this.getRoles();
    this.getMenuItems();
    this.createGridColumns();
  }

  public ngAfterViewInit() {
    this.ref.detectChanges();
    this.tableStructureComponent = new TableStructureComponent;
  }

  createGridColumns(): any {
    this.columns = [
      { name: 'Checkbox', property: 'checkbox', visible: true },
      { name: this.nameColumnName, property: 'name', visible: true, isModelProperty: true }
    ] as ListColumn[];
  }

  getRoles() {
    this.roles = [];
    this.ClientService.getRoles().subscribe((roles: RolePermission[]) => {
      if (roles) {
        roles.forEach(role => {
          this.roles.push({ label: role.name, value: Number(role.id) } as ListItem);
        });
      }
    });
  }

  onSave() {
    let RolePermissions: RolePermission[] = [];
    if (this.selectedRows && this.selectedRows.length) {
      this.selectedRows.forEach(x => {
        RolePermissions.push({ id: this.roleId.toString(), name: '', menuItemId: x.id });
      });
    }
    if (RolePermissions && RolePermissions.length) {
      this.menuItemService.addUserPagePermissions(RolePermissions).subscribe({
        next: (data: any) => {
          if (data) {
            this.notificationMessage('Role page permission added successfully', 'green-snackbar');
          }
        },
        error: (err) => {
          this.notificationMessage('Role page permission failed', 'red-snackbar');
        }
      });
    }
  }

  onChangeRoles(value) {
    this.roleId = value;
    const role = this.roles.find(x => x.value === value).label;
    this.getRoleMenuItems(role);
  }

  getRoleMenuItems(role: string) {
    this.selectedRows = [];
    this.tableStructureComponent.selection = new SelectionModel<any>(true, this.selectedRows);
    this.menuItemService.getRoleMenuItems(role).subscribe((data: RolePermission[]) => {
      if (data) {
        if (this.menuItems) {
          data.forEach(x => {
            const items = this.menuItems.find(menuItem => menuItem.id === x.menuItemId);
            if (items) {
              this.selectedRows.push(items);
            }
          });
          this.tableStructureComponent.selection = new SelectionModel<any>(true, this.selectedRows);
        }
      }
    });
  }

  getMenuItems() {
    this.menuItemService.getMenuItems().subscribe((data: any[]) => {
      let menuItems = [];
      if (data) {
        data.forEach(menuItem => {
          if (menuItem.routeOrFunction) {
            menuItems.push(menuItem);
          }
        });
      }
      this.menuItems = menuItems.sort((a, b) => a.name.localeCompare(b.name));
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

  onSelectedRows(selectedRows: any[]) {
    this.selectedRows = [];
    this.selectedRows = selectedRows;
  }

}
