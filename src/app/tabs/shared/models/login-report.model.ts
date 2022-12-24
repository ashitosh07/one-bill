export class LoginReport {
    id: number;
    userId: string;
    accountNumber: string;
    loginTime: Date;
    logoutTime: Date;
    ipAddress: string;
    fileName: string;
    createdDate:string;

    constructor(loginReport) {
        this.id = loginReport.id;
        this.userId = loginReport.userId;
        this.accountNumber = loginReport.accountNumber;
        this.loginTime = loginReport.loginTime;
        this.logoutTime = loginReport.logoutTime;
        this.ipAddress = loginReport.ipAddress;
        this.fileName = loginReport.fileName;
        this.createdDate =loginReport.createdDate;
    }
}