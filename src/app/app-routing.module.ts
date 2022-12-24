import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthenticationGuard } from './tabs/shared/guards/authentication.guard';
import { ChildAuthenticationGuard } from './tabs/shared/guards/child-authentication.guard';
import { RoleBasedAuthenticationGuard } from './tabs/shared/guards/rolebasedauthenthication.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/authentication/login/login.module').then(m => m.LoginModule),
  },
  {
    path: 'confirm-email',
    loadChildren: () => import('./pages/authentication/confirm-email/confirm-email.module').then(m => m.ConfirmEmailModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/authentication/register/register.module').then(m => m.RegisterModule),
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/authentication/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule),
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/authentication/reset-password/reset-password.module').then(m => m.ResetPasswordModule),
  },
  {
    path: 'coming-soon',
    loadChildren: () => import('./pages/coming-soon/coming-soon.module').then(m => m.ComingSoonModule),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [ChildAuthenticationGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/generaldashboard/generaldashboard.module').then(m => m.GeneraldashboardModule),
        pathMatch: 'full',
        canActivate: [AuthenticationGuard] && [RoleBasedAuthenticationGuard]
      },
      {

        path: 'generaldashboard',
        loadChildren: () => import('./pages/generaldashboard/generaldashboard.module').then(m => m.GeneraldashboardModule),
        pathMatch: 'full',
        canActivate: [AuthenticationGuard] && [RoleBasedAuthenticationGuard]
      },
      {

        path: 'tenantownerdashboard',
        loadChildren: () => import('./pages/tenant-owner-dashboard/tenant-owner-dashboard.module').then(m => m.TenantOwnerDashboardModule),
        pathMatch: 'full',
        canActivate: [AuthenticationGuard]
      },
      {

        path: 'openticketsdashboard',
        loadChildren: () => import('./pages/open-tickets-dashboard/open-tickets-dashboard/open-tickets-dashboard.module').then(m => m.OpenTicketsDashboardModule),
        pathMatch: 'full',
        canActivate: [AuthenticationGuard]
      },
      {

        path: 'announcement',
        loadChildren: () => import('../app/tabs/announcements/create-announcement.module').then(m => m.CreateAnnouncementModule),
        pathMatch: 'full',
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'owner-tenant',
        children: [
          {
            path: 'create-owner',
            loadChildren: () => import('./tabs/owner-tenant/create-owner/create-owner.module').then(m => m.CreateOwnerModule)
          },
          {
            path: 'create-client',
            loadChildren: () => import('./tabs/owner-tenant/create-client/create-client.module').then(m => m.CreateClientModule),
            pathMatch: 'full'
          },
          {
            path: 'create-owner-registered',
            loadChildren: () => import('./tabs/owner-tenant/create-owner-registered/create-owner-registered.module').then(m => m.CreateOwnerRegisteredModule)
          },
          {
            path: 'create-contract',
            loadChildren: () => import('./tabs/owner-tenant/create-contract/create-contract.module').then(m => m.CreateContractModule),
            pathMatch: 'full'
          },
          {
            path: 'create-service-disconnection',
            loadChildren: () => import('./tabs/owner-tenant/create-service-disconnection/create-service-disconnection.module').then(m => m.CreateServiceDisconnectionModule),
            pathMatch: 'full'
          }
        ],
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'general-settings',
        children: [
          {
            path: 'create-tax-settings',
            loadChildren: () => import('./tabs/general-settings/create-tax-settings/create-tax-settings.module').then(m => m.CreateTaxSettingsModule),
            pathMatch: 'full'
          }
        ],
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'settings',
        children: [
          {
            path: 'create-benchmark-settings',
            loadChildren: () => import('./tabs/settings/create-benchmark-settings/create-benchmark-settings.module').then(m => m.CreateBenchmarkSettingsModule),
            pathMatch: 'full'
          },
          {
            path: 'create-billperiod',
            loadChildren: () => import('./tabs/settings/create-billperiod/create-billperiod.module').then(m => m.CreateBillPeriodModule),
            pathMatch: 'full'
          },
          {
            path: 'create-billsettings',
            loadChildren: () => import('./tabs/settings/create-billsettings/create-billsettings.module').then(m => m.CreateBillsettingsModule),
            pathMatch: 'full'
          },
          {
            path: 'create-billline',
            loadChildren: () => import('./tabs/settings/create-billhead/create-billhead.module').then(m => m.CreateBillheadModule),
            pathMatch: 'full'
          },
          {
            path: 'create-bill-head-transaction',
            loadChildren: () => import('./tabs/settings/create-bill-head-transaction/create-bill-head-transaction.module').then(m => m.CreateBillHeadTransactionModule),
            pathMatch: 'full'
          },
          {
            path: 'create-meter-replacement',
            loadChildren: () => import('./tabs/settings/create-meter-replacement/create-meter-replacement.module').then(m => m.CreateMeterReplacementModule),
            pathMatch: 'full'
          },
          {
            path: 'create-unit-master',
            loadChildren: () => import('./tabs/settings/create-unit-master/create-unit-master.module').then(m => m.CreateUnitMasterModule),
            pathMatch: 'full'
          },
          {
            path: 'create-billtag',
            loadChildren: () => import('./tabs/settings/create-billtag/create-billtag.module').then(m => m.CreateBilltagModule),
            pathMatch: 'full'
          },
          {
            path: 'create-alert-settings-ems',
            loadChildren: () => import('./tabs/settings/create-alert-settings-ems/create-alert-settings-ems.module').then(m => m.CreateAlertSettingsEMSModule),
            pathMatch: 'full'
          },
          {
            path: 'manage-workflow-rules',
            loadChildren: () => import('./tabs/settings/manage-workflow-rules/manage-workflow-rules.module').then(m => m.ManageWorkflowRulesModule),
            pathMatch: 'full'
          }
        ],
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'create-user',
        loadChildren: () => import('./tabs/user/create-user/create-user.module').then(m => m.CreateUserModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'tariff-settings',
        loadChildren: () => import('./tabs/tariff-settings/tariff-settings.module').then(m => m.TariffSettingsModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'loginreport',
        loadChildren: () => import('./tabs/loginreport/loginreport.module').then(m => m.LoginreportModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'acceptance-report',
        loadChildren: () => import('./tabs/acceptance-report/acceptance-report.module').then(m => m.AcceptanceReportModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'CommunicationSummary',
        loadChildren: () => import('./tabs/communication-summary/communication-summary.module').then(m => m.CommunicationSummaryModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'EmsAlarm',
        loadChildren: () => import('./tabs/ems-alarm/ems-alarm.module').then(m => m.EmsAlarmModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'advance-payment',
        loadChildren: () => import('./tabs/advance-payment/advance-payment.module').then(m => m.AdvancePaymentModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'advance-in-hand',
        loadChildren: () => import('./tabs/advance-payment/advance-in-hand/advance-in-hand.module').then(m => m.AdvanceInHandModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            loadChildren: () => import('./tabs/admin/users/users.module').then(m => m.UsersModule),
            pathMatch: 'full'
          },
          {
            path: 'create-user',
            loadChildren: () => import('./tabs/user/create-user/create-user.module').then(m => m.CreateUserModule),
            pathMatch: 'full'
          },
          {
            path: 'user-page-permission',
            loadChildren: () => import('./tabs/user/user.module').then(m => m.UserModule),
            pathMatch: 'full'
          }
        ],
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'master',
        children: [
          {
            path: 'create-masterdetails',
            loadChildren: () => import('./tabs/master/create-masterdetails/create-masterdetails.module').then(m => m.CreateMasterDetailsModule),
            pathMatch: 'full'
          }
        ],
        canActivate: [AuthenticationGuard]
      },

      //       {
      //   path:'settings',
      //   children:[
      //     {
      //       path:'create-billsetting',
      //       loadChildren:()=>import('./tabs/settings/create-billsetting/create-billsettings.module').then(m=>m.CreateBillsettingsModule),
      //       pathMatch:'full'
      //     }
      //   ]
      // },
      {
        path: 'apps/inbox',
        loadChildren: () => import('./pages/apps/inbox/inbox.module').then(m => m.InboxModule),
        //canActivate: [AuthenticationGuard],
      },
      {
        path: 'apps/calendar',
        loadChildren: () => import('./pages/apps/calendar/calendar.module').then(m => m.CalendarAppModule),
        //canActivate: [AuthenticationGuard],
      },
      {
        path: 'apps/chat',
        loadChildren: () => import('./pages/apps/chat/chat.module').then(m => m.ChatModule),
        // canActivate: [AuthenticationGuard],
      },
      {
        path: 'components',
        loadChildren: () => import('./pages/components/components.module').then(m => m.ComponentsModule),
        //canActivate: [AuthenticationGuard],
      },
      {
        path: 'meter',
        children: [
          {
            path: 'create-meter-error-details',
            loadChildren: () => import('./tabs/meter/create-meter-error-details/create-meter-error-details.module').then(m => m.MeterErrorDetailsModule),
          },
          {
            path: 'create-device-data-details',
            loadChildren: () => import('./tabs/meter/create-device-data-details/create-device-data-details.module').then(m => m.MeterDeviceDataDetailsModule),
          }
        ],
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'bill',
        children: [
          {
            path: 'create-variablepay',
            loadChildren: () => import('./tabs/bill/create-variablepay/create-variablepay.module').then(m => m.CreateVariablePayModule),
            pathMatch: 'full'
          },
          {
            path: 'create-voucher',
            loadChildren: () => import('./tabs/accounts/create-voucher-entry/create-voucher-entry.module').then(m => m.CreateVoucherEntryModule),
            pathMatch: 'full'
          },
          {
            path: 'create-voucher-update',
            loadChildren: () => import('./tabs/accounts/create-voucher-update/create-voucher-update.module').then(m => m.CreateVoucherUpdateModule),
            pathMatch: 'full'
          }
        ],
        canActivate: [AuthenticationGuard]
      },

      {
        path: 'bills',
        loadChildren: () => import('./tabs/bills/bills.module').then(m => m.BillsModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'notification-logs',
        loadChildren: () => import('./tabs/notificatoin-logs/notification-logs.module').then(m => m.NotificatoinLogsModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'forms/form-elements',
        loadChildren: () => import('./pages/forms/form-elements/form-elements.module').then(m => m.FormElementsModule)
      },
      {
        path: 'forms/form-wizard',
        loadChildren: () => import('./pages/forms/form-wizard/form-wizard.module').then(m => m.FormWizardModule),
      },
      {
        path: 'icons',
        loadChildren: () => import('./pages/icons/icons.module').then(m => m.IconsModule),
      },
      {
        path: 'page-layouts',
        loadChildren: () => import('./pages/page-layouts/page-layouts.module').then(m => m.PageLayoutsModule),
      },
      {
        path: 'maps/google-maps',
        loadChildren: () => import('./pages/maps/google-maps/google-maps.module').then(m => m.GoogleMapsModule),
      },
      {
        path: 'tables/all-in-one-table',
        loadChildren: () => import('./pages/tables/all-in-one-table/all-in-one-table.module').then(m => m.AllInOneTableModule),
      },
      {
        path: 'drag-and-drop',
        loadChildren: () => import('./pages/drag-and-drop/drag-and-drop.module').then(m => m.DragAndDropModule)
      },
      {
        path: 'editor',
        loadChildren: () => import('./pages/editor/editor.module').then(m => m.EditorModule),
      },
      {
        path: 'templates',
        loadChildren: () => import('./pages/templates/templates.module').then(m => m.TemplatesModule),
      },
      {
        path: 'send',
        loadChildren: () => import('./pages/sendsms/sendsms.module').then(m => m.SendsmsModule),
      },
      {
        path: 'blank',
        loadChildren: () => import('./pages/blank/blank.module').then(m => m.BlankModule),
      },
      {
        path: 'level1/level2/level3/level4/level5',
        loadChildren: () => import('./pages/level5/level5.module').then(m => m.Level5Module),
      },
      {
        path: 'tables/all-in-one-client-table',
        loadChildren: () => import('./pages/client/all-in-one-client-table.module').then(m => m.AllInOneClientTableModule),
      },
      {
        path: 'tickets',
        loadChildren: () => import('./pages/tickets/ticketlist/ticketlist.module').then(m => m.TicketlistModule),
      },

      {
        path: 'userprofile',
        loadChildren: () => import('./pages/user-profile/user-profile.module').then(m => m.UserProfileModule),
      },
      {
        path: 'telephonecall',
        loadChildren: () => import('./pages/telephonecall/telephonecall.module').then(m => m.TelephonecallModule),
      },
      {
        path: 'createnews',
        loadChildren: () => import('./pages/createnews/createnews.module').then(m => m.CreatenewsModule),
      },
      {
        path: 'listemails',
        loadChildren: () => import('./pages/listemails/listemails/listemails.module').then(m => m.ListemailsModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'clientsettings',
        loadChildren: () => import('./tabs/clientsettings/clientsettings/clientsettings.module').then(m => m.ClientsettingsModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'imports/data',
        loadChildren: () => import('./tabs/bulk-import/bulk-import.module').then(m => m.BulkImportModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'meterreading',
        loadChildren: () => import('./tabs/meter-reading/meter-reading.module').then(m => m.MeterReadingModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'estidamadashboard',
        loadChildren: () => import('./tabs/estidamadashboard/estidamadashboard.module').then(m => m.EstidamadashboardModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'utility-data-view',
        loadChildren: () => import('./tabs/ems-dashboard/ems-dashboard.module').then(m => m.EmsDashboardModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'energy-cost',
        loadChildren: () => import('./tabs/ems-dashboard/ems-energy-cost/ems-energy-cost.module').then(m => m.EmsEnergyCostModule),
        //canActivate: [AuthenticationGuard]
      },
      {
        path: 'groupwise-energy-cost',
        loadChildren: () => import('./tabs/ems-dashboard/ems-groupwise-energycost/ems-groupwise-energycost.module').then(m => m.EmsGroupwiseEnergyCostModule),
        //canActivate: [AuthenticationGuard]
      },
      {
        path: 'metergroup',
        loadChildren: () => import('./tabs/meter-group/meter-group-module').then(m => m.MeterGroupModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'summarychart',
        loadChildren: () => import('./tabs/summary-chart/summary-chart/summary-chart.module').then(m => m.SummaryChartModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'login-credentials',
        loadChildren: () => import('./tabs/login-credentials/login-credentials.module').then(m => m.LoginCredentialsModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'chat-ui',
        loadChildren: () => import('./tabs/chat-ui/chat-ui.module').then(m => m.ChatUiModule)
      },
      {
        path: 'estidama-chart',
        loadChildren: () => import('./tabs/estidama-chart/estidama-chart.module').then(m => m.EstidamaChartModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'parameter-chart',
        loadChildren: () => import('./tabs/parameter-chart/parameter-chart.module').then(m => m.ParameterChartModule),
        canActivate: [AuthenticationGuard]
      },
      {
        path: 'single-line-diagram',
        loadChildren: () => import('./tabs/single-line-diagram/single-line-diagram.module').then(m => m.SingleLineDiagramModule),
        canActivate: [AuthenticationGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled',
    // preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
