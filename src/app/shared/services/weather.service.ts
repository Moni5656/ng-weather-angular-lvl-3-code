import {effect, inject, Injectable, Signal, signal} from '@angular/core';
import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from '../types/current-conditions.type';
import {ConditionsAndZip} from '../types/conditions-and-zip.type';
import {Forecast} from '../../forecasts-list/forecast.type';
import {LocationService, UpdateActions} from './location.service';
import {CachingSystemService} from './caching-system.service';
import {tap} from 'rxjs/operators';

@Injectable()
export class WeatherService {

    static URL = 'https://api.openweathermap.org/data/2.5';
    static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
    static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';

    private currentConditions = signal<ConditionsAndZip[]>([]);
    private locationService = inject(LocationService)
    private cachingSystemService = inject(CachingSystemService)

    constructor(private http: HttpClient) {
        effect(() => this.handleLocationUpdates(), {allowSignalWrites: true});
    }

    handleLocationUpdates() {
        const {zipcodes: updatedZipcodes, action} = this.locationService.locationUpdate();
        const uniqueUpdatedZipCodes = new Set(updatedZipcodes)
        action === UpdateActions.Add
            ? this.addConditionsForNewZipcodes(uniqueUpdatedZipCodes)
            : this.removeConditionsForZipcodes(updatedZipcodes);
    }

    // added console logs to facilitate evaluating the caching system
    addCurrentConditions(zipcode: string): void {
        const cachedData = this.cachingSystemService.getItem<CurrentConditions>(zipcode + 'Conditions');

        if (cachedData) {
            console.log('Returning cached data:', cachedData);
            this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data: cachedData}]);
        } else {
            console.log('No cached data found, fetching from API');
            this.fetchAndStoreCurrentConditionsFromApi(zipcode)
        }
    }

    fetchAndStoreCurrentConditionsFromApi(zipcode: string) {
        this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
            .pipe(tap(data => {
                this.currentConditions.update(conditions => [...conditions, {zip: zipcode, data}]);
                console.log('Caching new data:', data);
                this.cachingSystemService.addDataToCache(zipcode + 'Conditions', data);
            })).subscribe();
    }

    removeCurrentConditions(zipcode: string): void {
        this.currentConditions.update(conditions =>
            conditions.filter(condition => condition.zip !== zipcode)
        );
    }

    getCurrentConditions(): Signal<ConditionsAndZip[]> {
        return this.currentConditions.asReadonly();
    }

    getForecast(zipcode: string): Observable<Forecast> {
        // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
        const cachedData = this.cachingSystemService.getItem<Forecast>(zipcode + 'Forecast');

        if (cachedData) {
            console.log('Returning cached data:', cachedData);
            return of(cachedData);
        }

        this.fetchAndStoreForecastFromApi(zipcode)
    }

    fetchAndStoreForecastFromApi(zipcode: string) {
        console.log('No cached data found, fetching from API');
        return this.http.get<Forecast>(
            `${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`
        ).pipe(
            tap(data => {
                console.log('Caching new data:', data);
                this.cachingSystemService.addDataToCache(zipcode + 'Forecast', data);
            })
        );
    }

    getWeatherIcon(id): string {
        if (id >= 200 && id <= 232) {
            return WeatherService.ICON_URL + 'art_storm.png';
        } else if (id >= 501 && id <= 511) {
            return WeatherService.ICON_URL + 'art_rain.png';
        } else if (id === 500 || (id >= 520 && id <= 531)) {
            return WeatherService.ICON_URL + 'art_light_rain.png';
        } else if (id >= 600 && id <= 622) {
            return WeatherService.ICON_URL + 'art_snow.png';
        } else if (id >= 801 && id <= 804) {
            return WeatherService.ICON_URL + 'art_clouds.png';
        } else if (id === 741 || id === 761) {
            return WeatherService.ICON_URL + 'art_fog.png';
        } else {
            return WeatherService.ICON_URL + 'art_clear.png';
        }
    }

    private addConditionsForNewZipcodes(zipcodes: Set<string>): void {
        zipcodes.forEach(zipcode => {
            if (!this.isZipcodeInConditions(zipcode)) {
                this.addCurrentConditions(zipcode);
            }
        });
    }

    private removeConditionsForZipcodes(zipcodes: string[]): void {
        zipcodes.forEach(zipcode => this.removeCurrentConditions(zipcode));
    }

    private isZipcodeInConditions(zipcode: string): boolean {
        return this.currentConditions().some(condition => condition.zip === zipcode);
    }

}
