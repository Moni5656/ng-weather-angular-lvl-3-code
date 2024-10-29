import {Component, computed, inject, Signal} from '@angular/core';
import {WeatherService} from '../shared/services/weather.service';
import {LocationService} from '../shared/services/location.service';
import {Router} from '@angular/router';
import {ConditionsAndZip} from '../shared/types/conditions-and-zip.type';

@Component({
    selector: 'app-current-conditions',
    templateUrl: './current-conditions.component.html',
    styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {

    protected weatherService = inject(WeatherService);
    protected locationService = inject(LocationService);
    protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.getCurrentConditions();
    protected tabLabels = computed(() =>
        this.currentConditionsByZip().map(location => `${location.data.name} (${location.zip})`)
    );
    private router = inject(Router);

    showForecast(zipcode: string) {
        this.router.navigate(['/forecast', zipcode])
    }
}
