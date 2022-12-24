import  { AnnouncementClient } from './announcement-client.model';
export class Announcement 
{
    id: number;
    validTill: string;
    validTillLocal?: string;
    title: string;
    content: string;
    clients: AnnouncementClient[];

    constructor(announcement) 
    {
        this.id = announcement.id || 0;
        this.validTill=announcement.validTill || '';
        this.title = announcement.title || '';
        this.content = announcement.content || '';
        this.clients = (announcement.clients || []).map(client => new AnnouncementClient(client));
    }
}        

