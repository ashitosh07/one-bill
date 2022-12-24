
export class BenchmarkSetting {
    rowid: number;
    parameterId: number;
    parameterName: string;
    type: string;
    target: string;
    meter: string;
    meterTypeId: number;
    clientId: number;

    constructor(benchmark) {
        this.rowid = benchmark.rowid || 0;
        this.parameterId = benchmark.parameterId || 0;
        this.parameterName = benchmark.parameterName || '';
        this.type = benchmark.type || '';
        this.target = benchmark.target || '';
        this.meter = benchmark.meter || '';
        this.meterTypeId = benchmark.meterTypeId || 0;
        this.clientId = benchmark.clientId || 0;
    }
}  