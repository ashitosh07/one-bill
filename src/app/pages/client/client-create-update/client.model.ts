export class Client {
  id?:number;
  clientId?: number;
  clientName?: string;
  mobile?: number;

  constructor(client) {
    this.clientId = client.id;
    this.clientName = client.clientName;
    this.mobile = client.mobile;

  }

}
