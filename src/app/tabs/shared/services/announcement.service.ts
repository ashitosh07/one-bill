import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { EnvService } from 'src/app/env.service';

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {

    baseUrl = '';


    constructor(private http: HttpClient,
        private envService: EnvService) {
        this.baseUrl = envService.backend;
    }

    getAnnouncements(clientId) {
        return this.http.get(this.baseUrl + '/announcements/clientId/' + clientId);
    }

    getAnnouncementById(id) {
        return this.http.get(this.baseUrl + '/announcements/' + id);
    }

    createAnnouncement(announcement) {
        return this.http.post(this.baseUrl + '/announcements/', announcement);
    }

    updateAnnouncementById(id, announcement) {
        return this.http.put(this.baseUrl + '/announcements/' + id, announcement);
    }

    deleteAnnouncementById(id, announcement) {
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: announcement
        }
        return this.http.delete(this.baseUrl + '/announcements/' + id, options);
    }

    getClients() {
        return this.http.get(this.baseUrl + '/announcements/clients');
    }
}