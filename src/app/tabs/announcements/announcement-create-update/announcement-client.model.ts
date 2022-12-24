
export class AnnouncementClient 
{
    id: number;
    announcementId: number;
    clientId: number;    

    constructor(announcementClient) 
    {
        this.id = announcementClient.id || 0;
        this.announcementId=announcementClient.announcementId || '';
        this.clientId = announcementClient.clientId || '';
    }
}        

