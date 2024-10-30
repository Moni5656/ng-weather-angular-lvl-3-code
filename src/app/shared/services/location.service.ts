import {Injectable, signal, WritableSignal} from '@angular/core';

export const LOCATIONS = 'locations';

export enum UpdateActions { Add = 'ADD', Delete = 'DELETE'}

export interface LocationUpdate {
    action: UpdateActions,
    zipcodes: string[]
}

@Injectable()
export class LocationService {

    locationUpdate: WritableSignal<LocationUpdate> = signal(<any>{})
    private locations: string[] = [];

    constructor() {
        this.loadLocationsFromStorage()
        this.locationUpdate.set({action: UpdateActions.Add, zipcodes: this.locations})
    }

    loadLocationsFromStorage() {
        const locString = localStorage.getItem(LOCATIONS);
        if (locString) {
            this.locations = JSON.parse(locString);
        }
    }

    addLocation(zipcode: string) {
        this.locations.push(zipcode);
        localStorage.setItem(LOCATIONS, JSON.stringify(this.locations));
        this.locationUpdate.set({action: UpdateActions.Add, zipcodes: [zipcode]})
    }

    removeLocation(zipcode: string) {
        const index = this.locations.indexOf(zipcode);
        if (index !== -1) {
            this.locations.splice(index, 1);
            localStorage.setItem(LOCATIONS, JSON.stringify(this.locations));
            this.locationUpdate.set({action: UpdateActions.Delete, zipcodes: [zipcode]})
        }
    }
}
