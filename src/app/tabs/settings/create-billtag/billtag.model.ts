export class Billtag{
    id:number;
    deviceId:number;
    billSettingsId:number;
    billSettingsName:string;
    clientId:number;
    clientName:string;
    constructor(billtag){
        this.id=billtag.id || 0;
        this.deviceId=billtag.deviceId || 0;
        this.billSettingsId=billtag.billSettingsId || 0;
        this.billSettingsName=billtag.billSettingsName || '';
        this.clientId=billtag.clientId || 0;
        this.clientName=billtag.clientName ||'';

    }
}