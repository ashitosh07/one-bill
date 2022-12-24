import { AverageMonthlyUsage } from '../../../../app/tabs/shared/models/average-monthly-usage.model';
import { AccountStatus } from '../../../../app/tabs/shared/models/account-status.model';
import { BarChartData } from './bar-chart-data.model';
export class OwnerTenantDashboardData {
    averageMonthlyUsage?: AverageMonthlyUsage;
    accountStatus?: AccountStatus;
    barChartDataList?: BarChartData[];
}