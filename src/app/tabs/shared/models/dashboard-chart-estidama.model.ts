import { GraphValues } from "./graph-values.model";

export class DashboardChartEstidama {
    consumption?: string;
    average?: string;
    peak?: string;
    target?: string;
    displayDate?: string;
    benchMarkList?: GraphValues[];
    graphItemList?: GraphValues[];
    graphItemComparisonList?: GraphValues[];
}