import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateTariffSettingsComponent } from './create-tariff-settings/create-tariff-settings.component';
import { EditTariffSettingsComponent } from './edit-tariff-settings/edit-tariff-settings.component';
import { EditSlabTariffSettingsComponent } from './edit-slab-tariff-settings/edit-slab-tariff-settings.component';

const routes: Routes = [
    {
        path: 'create-tariff-settings',
        component: CreateTariffSettingsComponent
    },
    {
        path: 'tariff-settings',
        component: EditTariffSettingsComponent
    },
    {
        path: 'slab-tariff-settings',
        component: EditSlabTariffSettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TariffSettingsRoutingModule {
}
