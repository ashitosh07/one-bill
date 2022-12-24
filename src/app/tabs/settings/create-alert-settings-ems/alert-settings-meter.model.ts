export class AlertSettingsMeter {
    id: number;
    alarmId: number;
    meterId: number;

    constructor(alertSettingsMeter) {
        this.id = alertSettingsMeter.id || 0;
        this.alarmId = alertSettingsMeter.alarmId || 0;
        this.meterId = alertSettingsMeter.meterId || 0;
    }
}