import { GraphValues } from "./graph-values.model";

export class ParameterChart {
    consumption?: string;
    average?: string;
    peak?: string;
    target?: string;
    displayDate?: string;
    benchMarkList?: GraphValues[];
    graphItemList?: GraphValues[];
    graphItemComparisonList?: GraphValues[];
}