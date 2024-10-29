import {Injectable, signal, WritableSignal} from '@angular/core';

export const LOCATIONS = 'locations';

export enum UPDATE_ACTIONS {Add = 'ADD', Delete = 'DELETE'}

export interface LocationUpdate {
    action: string,
    zipcodes: string[]
}

@Injectable()
export class LocationService {

    locations: string[] = [];
    locationUpdate: WritableSignal<LocationUpdate> = signal(<any>{})

    constructor() {
        const locString = localStorage.getItem(LOCATIONS);
        if (locString) {
            this.locations = JSON.parse(locString);
        }
        this.locationUpdate.set({action: UPDATE_ACTIONS.Add, zipcodes: this.locations})
    }

    addLocation(zipcode: string) {
        this.locations.push(zipcode);
        localStorage.setItem(LOCATIONS, JSON.stringify(this.locations));
        this.locationUpdate.set({action: UPDATE_ACTIONS.Add, zipcodes: [zipcode]})
    }

    removeLocation(zipcode: string) {
        const index = this.locations.indexOf(zipcode);
        if (index !== -1) {
            this.locations.splice(index, 1);
            localStorage.setItem(LOCATIONS, JSON.stringify(this.locations));
            this.locationUpdate.set({action: UPDATE_ACTIONS.Delete, zipcodes: [zipcode]})
        }
    }
}
