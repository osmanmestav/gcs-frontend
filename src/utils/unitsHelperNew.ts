import { getEnumKeyByEnumValue, getEnumKeys } from "./enumHelpers";

enum UnitSystemEnum {
    SI = 0,
    US = 1
};

export enum UnitTypeEnum {
    None =  0,
    Distance = 1,
    ShortDistance = 2,
    LongDistance = 3,
    Altitude = 4,
    HorizontalSpeed = 5,
    VerticalSpeed = 6,
    WindSpeed = 7,
    TimePrecise = 8,
    LatLon = 9,
    Weight = 10,
    Volume = 11,
    Temperature = 12
};

type UnitTypeSystemMap = {
    type: UnitTypeEnum;
    system: UnitSystemEnum;
};

class LengthHelper {
    value: number = 0;

    fromMeters =  (v: number) => {
        this.value = v;
        return this;
    };

    fromFeet =  (v: number) => {
        this.value = v * 0.3048;
        return this;
    };

    fromNauticalMiles =  (v: number) => {
        this.value = v * 1852;
        return this;
    };

    fromKilometers =  (v: number) => {
        this.value = v * 1000;
        return this;
    };

    toMeters = () => {
        return this.value;
    };

    toFeet = () => {
        return this.value / 0.3048;
    };

    toNauticalMiles = () => {
        return this.value / 1852;
    };

    toKilometers = () => {
        return this.value / 1000;
    };

    fromMetersToKilometers = (v: number) => {
        return this.fromMeters(v).toKilometers();
    };
};

class SpeedHelper {
    value: number = 0;

    fromMetersPerSecond = (v: number) => {
        this.value = v;
        return this;
    };

    fromFeetPerSecond = (v: number) => {
        this.value = v * 0.3048;
        return this;
    };

    fromKnots= (v: number) => {
        this.value = v * 0.514444;
        return this;
    };

    fromKilometersPerHour = (v: number) => {
        this.value = v / 3.6;
        return this;
    };

    toMetersPerSecond = () => {
        return this.value;
    };

    toFeetPerSecond = () => {
        return this.value / 0.3048;
    };

    toKnots = () => {
        return this.value / 0.514444;
    };

    toKilometersPerHour = () => {
        return this.value * 3.6;
    }
};

let mathRoundNew = function(value: number, digit: number = 0)
{
    var multiplier = Math.pow(10, digit);
    return Math.round(value * multiplier) / multiplier;
};

export class UnitsHelperNew {

    private static unitDictionaryNew : UnitTypeSystemMap[] = [
        {type: UnitTypeEnum.None, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.Distance, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.ShortDistance, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.LongDistance, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.Altitude, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.HorizontalSpeed, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.VerticalSpeed, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.WindSpeed, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.TimePrecise, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.LatLon, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.Weight, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.Volume, system: UnitSystemEnum.SI},
        {type: UnitTypeEnum.Temperature, system: UnitSystemEnum.SI},
    ];     

    static loadUnits = (unitDict: UnitTypeSystemMap[]) => {
        this.unitDictionaryNew = unitDict;
    };

    static setUnitSystem = (type : UnitTypeEnum, system: UnitSystemEnum) => {
        if(this.unitDictionaryNew.find(x=> x.type === type)){
            this.unitDictionaryNew.find(x=> x.type === type)!.system = system;
        }
    };

    static getUnitSystem = (type: UnitTypeEnum) => {
        if(this.unitDictionaryNew.find(x=> x.type === type)){
            return this.unitDictionaryNew.find(x=> x.type === type)!.system;
        }
        return UnitSystemEnum.SI;
    };

    // Used in browser js
    static getUnitSystemName = (type: UnitTypeEnum) => {
        const system = this.getUnitSystem(type);
        return getEnumKeyByEnumValue(UnitSystemEnum, system);
    };

    // Used in browser js
    static getUnitTypes = () => {
        return getEnumKeys(UnitTypeEnum);
    };

    static convertToString = (type: UnitTypeEnum, value: number) => {
        var unitSystem = this.getUnitSystem(type);
        var intValue = mathRoundNew(value);
        switch (type) {
            case UnitTypeEnum.LatLon:
                var minutes = (value - Math.floor(value)) * 60.0;
                var seconds = (minutes - Math.floor(minutes)) * 60.0;
                var tenths = (seconds - Math.floor(seconds)) * 10.0;
                // get rid of fractional part
                minutes = Math.floor(minutes);
                seconds = Math.floor(seconds);
                tenths = Math.floor(tenths);
                return `${intValue}° ${minutes}' ${seconds}.${tenths}`;
            case UnitTypeEnum.TimePrecise:
                var hour = mathRoundNew(intValue / 3600);
                var min = mathRoundNew(intValue / 60) % 60;
                var sec = intValue % 60;
                return `${hour}:${min}.${sec}`;
        }
        switch (unitSystem) {
            case UnitSystemEnum.SI:
                switch (type) {
                    case UnitTypeEnum.Altitude:
                        return mathRoundNew(value) + " m";
                    case UnitTypeEnum.Distance:
                        return mathRoundNew(value) + " m";
                    case UnitTypeEnum.ShortDistance:
                        return mathRoundNew(value, 1).toFixed(1) + " m";
                    case UnitTypeEnum.LongDistance:
                        return mathRoundNew(new LengthHelper().fromMetersToKilometers(value), 1) + " km";
                    case UnitTypeEnum.HorizontalSpeed:
                        return mathRoundNew(value, 1).toFixed(1) + " m/s";
                    case UnitTypeEnum.VerticalSpeed:
                        return mathRoundNew(value, 1).toFixed(1) + " m/s";
                    case UnitTypeEnum.WindSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toKilometersPerHour(), 0) + " kmph";
                    case UnitTypeEnum.Weight:
                        return mathRoundNew(value, 1) + " kg";
                    case UnitTypeEnum.Volume:
                        return mathRoundNew(value, 1) + " lt";
                    case UnitTypeEnum.Temperature:
                        return mathRoundNew(value, 1) + "°C";
                }
                break;
            case UnitSystemEnum.US:
                switch (type) {
                    case UnitTypeEnum.Altitude:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toFeet()) + " ft";
                    case UnitTypeEnum.Distance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toFeet()) + " ft";
                    case UnitTypeEnum.ShortDistance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toFeet(), 1).toFixed(1) + " ft";
                    case UnitTypeEnum.LongDistance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toNauticalMiles(), 1) + " NM";
                    case UnitTypeEnum.HorizontalSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toKnots(), 1).toFixed(1) + " kt";
                    case UnitTypeEnum.VerticalSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toFeetPerSecond() * 60) + " ft/min";
                    case UnitTypeEnum.WindSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toKnots(), 1).toFixed(1) + " kt";
                    case UnitTypeEnum.Weight:
                        return mathRoundNew(value * 2.20462, 1) + " lb";
                    case UnitTypeEnum.Volume:
                        return mathRoundNew(value * 0.264172, 1) + " gal";
                    case UnitTypeEnum.Temperature:
                        return mathRoundNew(value * 1.8 + 32) + "°F";
                }
                break;
        }
        return "";
    };

    static convertToSI = (unit: UnitTypeEnum, value: number) => {
        var unitSystem = this.getUnitSystem(unit);
        if (unitSystem === UnitSystemEnum.SI)
            return value;
        switch (unit) {
            case UnitTypeEnum.Altitude:
                return new LengthHelper().fromFeet(value).toMeters();
            case UnitTypeEnum.Distance:
                return new LengthHelper().fromFeet(value).toMeters();
            case UnitTypeEnum.ShortDistance:
                return new LengthHelper().fromFeet(value).toMeters();
            case UnitTypeEnum.LongDistance:
                return new LengthHelper().fromNauticalMiles(value).toKilometers();
            case UnitTypeEnum.HorizontalSpeed:
                return new SpeedHelper().fromKnots(value).toMetersPerSecond();
            case UnitTypeEnum.VerticalSpeed:
                return new SpeedHelper().fromFeetPerSecond(value / 60).toMetersPerSecond();
            case UnitTypeEnum.WindSpeed:
                return new SpeedHelper().fromKnots(value).toMetersPerSecond();
            case UnitTypeEnum.Weight:
                return (value / 2.20462);
            case UnitTypeEnum.Volume:
                return (value / 0.264172);
            case UnitTypeEnum.Temperature:
                return ((value - 32) / 1.8);
        }
        return 0;
    };

    static convertNumber = (type: UnitTypeEnum, value: number) => {
        var unitSystem = this.getUnitSystem(type);
        switch (unitSystem) {
            case UnitSystemEnum.SI:
                switch (type) {
                    case UnitTypeEnum.Altitude:
                        return mathRoundNew(value);
                    case UnitTypeEnum.Distance:
                        return mathRoundNew(value);
                    case UnitTypeEnum.ShortDistance:
                        return mathRoundNew(value, 1);
                    case UnitTypeEnum.LongDistance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toKilometers());
                    case UnitTypeEnum.HorizontalSpeed:
                        return mathRoundNew(value, 1);
                    case UnitTypeEnum.VerticalSpeed:
                        return mathRoundNew(value, 1);
                    case UnitTypeEnum.WindSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toKilometersPerHour(), 0);
                    case UnitTypeEnum.Weight:
                        return mathRoundNew(value, 1);
                    case UnitTypeEnum.Volume:
                        return mathRoundNew(value, 1);
                    case UnitTypeEnum.Temperature:
                        return mathRoundNew(value, 1);
                }
                break;
            case UnitSystemEnum.US:
                switch (type) {
                    case UnitTypeEnum.Altitude:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toFeet());
                    case UnitTypeEnum.Distance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toFeet());
                    case UnitTypeEnum.ShortDistance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toFeet(), 1);
                    case UnitTypeEnum.LongDistance:
                        return mathRoundNew(new LengthHelper().fromMeters(value).toNauticalMiles());
                    case UnitTypeEnum.HorizontalSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toKnots(), 1);
                    case UnitTypeEnum.VerticalSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toFeetPerSecond() * 60);
                    case UnitTypeEnum.WindSpeed:
                        return mathRoundNew(new SpeedHelper().fromMetersPerSecond(value).toKnots(), 1);
                    case UnitTypeEnum.Weight:
                        return mathRoundNew(value * 2.20462, 1);
                    case UnitTypeEnum.Volume:
                        return mathRoundNew(value * 0.264172, 1);
                    case UnitTypeEnum.Temperature:
                        return mathRoundNew(value * 1.8 + 32);
                }
                break;
        }
        return 0;
    };

    static getUnitText =  (type: UnitTypeEnum) => {
        var unitSystem = this.getUnitSystem(type);
        switch (unitSystem) {
            case UnitSystemEnum.SI:
                switch (type) {
                    case UnitTypeEnum.Altitude:
                        return "m";
                    case UnitTypeEnum.Distance:
                        return "m";
                    case UnitTypeEnum.ShortDistance:
                        return "m";
                    case UnitTypeEnum.LongDistance:
                        return "km";
                    case UnitTypeEnum.HorizontalSpeed:
                        return "m/s";
                    case UnitTypeEnum.VerticalSpeed:
                        return "m/s";
                    case UnitTypeEnum.WindSpeed:
                        return "kmph";
                    case UnitTypeEnum.Weight:
                        return "kg";
                    case UnitTypeEnum.Volume:
                        return "lt";
                    case UnitTypeEnum.Temperature:
                        return "°C";
                }
                break;
            case UnitSystemEnum.US:
                switch (type) {
                    case UnitTypeEnum.Altitude:
                        return "ft";
                    case UnitTypeEnum.Distance:
                        return "ft";
                    case UnitTypeEnum.ShortDistance:
                        return "ft";
                    case UnitTypeEnum.LongDistance:
                        return "NM";
                    case UnitTypeEnum.HorizontalSpeed:
                        return "kt";
                    case UnitTypeEnum.VerticalSpeed:
                        return "ft/min";
                    case UnitTypeEnum.WindSpeed:
                        return "kt";
                    case UnitTypeEnum.Weight:
                        return "lb";
                    case UnitTypeEnum.Volume:
                        return "gal";
                    case UnitTypeEnum.Temperature:
                        return "°F";
                }
                break;
        }
        return "";
    };
}