import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolePagePermissionsComponent } from '../role-page-permissions/role-page-permissions.component';
import { CreateUserComponent } from '../create-user/create-user.component';
import { RoleBasedAuthenticationGuard } from '../../shared/guards/rolebasedauthenthication.guard';

const routes: Routes = [
    {
        path: '',
        component: CreateUserComponent,
        canActivate: [RoleBasedAuthenticationGuard]
    },
    {
        path: '',
        component: RolePagePermissionsComponent,
        canActivate: [RoleBasedAuthenticationGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateUserRoutingModule {
}
