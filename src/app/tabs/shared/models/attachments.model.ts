export class Attachment{
    id?:number;
    attachmentName?:string;
    mailId?:number;
    folderName?: string;
    
    constructor(attachment){
        this.id=attachment.id;
        this.attachmentName=attachment.attachmentName;
        this.mailId=attachment.mailId;
        this.folderName = attachment.folderName;
    }    
}