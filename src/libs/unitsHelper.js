let UnitSystem = {
    SI: 0,
    US: 1
};

let UnitType = {
    None: 0,
    Distance: 1,
    ShortDistance: 2,
    LongDistance: 3,
    Altitude: 4,
    HorizontalSpeed: 5,
    VerticalSpeed: 6,
    WindSpeed: 7,
    TimePrecise: 8,
    LatLon: 9,
    Weight: 10,
    Volume: 11,
    Temperature: 12
};

// Default unit system is SI. Need to override this object as below for US units:
// unitDictionary[UnitType.Distance] = UnitSystem.US;
let unitDictionary = {};
Object.values(UnitType).forEach(k => unitDictionary[k] = UnitSystem.SI);

let Length = {
    value: 0,
    fromMeters: (v) => {
        Length.value = v;
        return this;
    },
    fromFeet: (v) => {
        Length.value = v * 0.3048;
        return this;
    },
    fromNauticalMiles: (v) => {
        Length.value = v * 1852;
        return this;
    },
    fromKilometers: (v) => {
        Length.value = v * 1000;
        return this;
    },
    toMeters: function () {
        return Length.value;
    },
    toFeet: function () {
        return Length.value / 0.3048;
    },
    toNauticalMiles: function () {
        return Length.value / 1852;
    },
    toKilometers: function () {
        return Length.value / 1000;
    },
    fromMetersToKilometers: (v) => {
        Length.fromMeters(v);
        return Length.toKilometers();
    }
};

let Speed = {
    value: 0,
    fromMetersPerSecond: function (v) {
        Speed.value = v;
        return this;
    },
    fromFeetPerSecond: function (v) {
        Speed.value = v * 0.3048;
        return this;
    },
    fromKnots: function (v) {
        Speed.value = v * 0.514444;
        return this;
    },
    fromKilometersPerHour: function (v) {
        Speed.value = v / 3.6;
        return this;
    },
    toMetersPerSecond: function () {
        return Speed.value;
    },
    toFeetPerSecond: function () {
        return Speed.value / 0.3048;
    },
    toKnots: function () {
        return Speed.value / 0.514444;
    },
    toKilometersPerHour: function () {
        return Speed.value * 3.6;
    }
};

let UnitsHelper = {
    loadUnits: function (unitDict) {
        unitDictionary = unitDict;
    },
    setUnitSystem(/*UnitType*/type,/*UnitSystem*/system) {
        unitDictionary[type] = system;
    },
    convertToString: function (/*UnitType*/ type, /*double*/ value) {
        var unitSystem = this.getUnitSystem(type);
        var intValue = Math.round(value);
        switch (type) {
            case UnitType.LatLon:
                var minutes = (value - Math.floor(value)) * 60.0;
                var seconds = (minutes - Math.floor(minutes)) * 60.0;
                var tenths = (seconds - Math.floor(seconds)) * 10.0;
                // get rid of fractional part
                minutes = Math.floor(minutes);
                seconds = Math.floor(seconds);
                tenths = Math.floor(tenths);
                return `${intValue}° ${minutes}' ${seconds}.${tenths}`;
            case UnitType.TimePrecise:
                var hour = Math.round(intValue / 3600);
                var min = Math.round(intValue / 60) % 60;
                var sec = intValue % 60;
                return `${hour}:${min}.${sec}`;
        }
        switch (unitSystem) {
            case UnitSystem.SI:
                switch (type) {
                    case UnitType.Altitude:
                        return Math.round(value) + " m";
                    case UnitType.Distance:
                        return Math.round(value) + " m";
                    case UnitType.ShortDistance:
                        return Math.round(value, 1).toFixed(1) + " m";
                    case UnitType.LongDistance:
                        return Math.round(Length.fromMetersToKilometers(value), 1) + " km";
                    case UnitType.HorizontalSpeed:
                        return Math.round(value, 1).toFixed(1) + " m/s";
                    case UnitType.VerticalSpeed:
                        return Math.round(value, 1).toFixed(1) + " m/s";
                    case UnitType.WindSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toKilometersPerHour(), 0) + " kmph";
                    case UnitType.Weight:
                        return Math.round(value, 1) + " kg";
                    case UnitType.Volume:
                        return Math.round(value, 1) + " lt";
                    case UnitType.Temperature:
                        return Math.round(value, 1) + "°C";
                }
                break;
            case UnitSystem.US:
                switch (type) {
                    case UnitType.Altitude:
                        return Math.round(Length.fromMeters(value).toFeet()) + " ft";
                    case UnitType.Distance:
                        return Math.round(Length.fromMeters(value).toFeet()) + " ft";
                    case UnitType.ShortDistance:
                        return Math.round(Length.fromMeters(value).toFeet(), 1).toFixed(1) + " ft";
                    case UnitType.LongDistance:
                        return Math.round(Length.fromMeters(value).toNauticalMiles(), 1) + " NM";
                    case UnitType.HorizontalSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toKnots(), 1).toFixed(1) + " kt";
                    case UnitType.VerticalSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toFeetPerSecond() * 60) + " ft/min";
                    case UnitType.WindSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toKnots(), 1).toFixed(1) + " kt";
                    case UnitType.Weight:
                        return Math.round(value * 2.20462, 1) + " lb";
                    case UnitType.Volume:
                        return Math.round(value * 0.264172, 1) + " gal";
                    case UnitType.Temperature:
                        return Math.round(value * 1.8 + 32) + "°F";
                }
                break;
        }
        return "";
    },

    convertToSI: function (/*UnitType*/ unit, /*double*/ value) {
        var unitSystem = unitDictionary[unit];
        if (unitSystem == UnitSystem.SI)
            return value;
        switch (unit) {
            case UnitType.Altitude:
                return Length.fromFeet(value).toMeters();
            case UnitType.Distance:
                return Length.fromFeet(value).toMeters();
            case UnitType.ShortDistance:
                return Length.fromFeet(value).toMeters();
            case UnitType.LongDistance:
                return Length.fromNauticalMiles(value).toKilometers();
            case UnitType.HorizontalSpeed:
                return Speed.fromKnots(value).toMetersPerSecond();
            case UnitType.VerticalSpeed:
                return Speed.fromFeetPerSecond(value / 60).toMetersPerSecond();
            case UnitType.WindSpeed:
                return Speed.fromKnots(value).toMetersPerSecond();
            case UnitType.Weight:
                return (value / 2.20462);
            case UnitType.Volume:
                return (value / 0.264172);
            case UnitType.Temperature:
                return ((value - 32) / 1.8);
        }
        return 0;
    },

    convertNumber: function (/*UnitType*/ type, /*double*/ value) {
        var unitSystem = unitDictionary[type];
        switch (unitSystem) {
            case UnitSystem.SI:
                switch (type) {
                    case UnitType.Altitude:
                        return Math.round(value);
                    case UnitType.Distance:
                        return Math.round(value);
                    case UnitType.ShortDistance:
                        return Math.round(value, 1);
                    case UnitType.LongDistance:
                        return Math.round(Length.fromMeters(value).toKilometers());
                    case UnitType.HorizontalSpeed:
                        return Math.round(value, 1);
                    case UnitType.VerticalSpeed:
                        return Math.round(value, 1);
                    case UnitType.WindSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toKilometersPerHour(), 0);
                    case UnitType.Weight:
                        return Math.round(value, 1);
                    case UnitType.Volume:
                        return Math.round(value, 1);
                    case UnitType.Temperature:
                        return Math.round(value, 1);
                }
                break;
            case UnitSystem.US:
                switch (type) {
                    case UnitType.Altitude:
                        return Math.round(Length.fromMeters(value).toFeet());
                    case UnitType.Distance:
                        return Math.round(Length.fromMeters(value).toFeet());
                    case UnitType.ShortDistance:
                        return Math.round(Length.fromMeters(value).toFeet(), 1);
                    case UnitType.LongDistance:
                        return Math.round(Length.fromMeters(value).toNauticalMiles());
                    case UnitType.HorizontalSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toKnots(), 1);
                    case UnitType.VerticalSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toFeetPerSecond() * 60);
                    case UnitType.WindSpeed:
                        return Math.round(Speed.fromMetersPerSecond(value).toKnots(), 1);
                    case UnitType.Weight:
                        return Math.round(value * 2.20462, 1);
                    case UnitType.Volume:
                        return Math.round(value * 0.264172, 1);
                    case UnitType.Temperature:
                        return Math.round(value * 1.8 + 32);
                }
                break;
        }
        return 0;
    },

    getUnitText: function (/*UnitType*/ type) {
        var unitSystem = unitDictionary[type];
        switch (unitSystem) {
            case UnitSystem.SI:
                switch (type) {
                    case UnitType.Altitude:
                        return "m";
                    case UnitType.Distance:
                        return "m";
                    case UnitType.ShortDistance:
                        return "m";
                    case UnitType.LongDistance:
                        return "km";
                    case UnitType.HorizontalSpeed:
                        return "m/s";
                    case UnitType.VerticalSpeed:
                        return "m/s";
                    case UnitType.WindSpeed:
                        return "kmph";
                    case UnitType.Weight:
                        return "kg";
                    case UnitType.Volume:
                        return "lt";
                    case UnitType.Temperature:
                        return "°C";
                }
                break;
            case UnitSystem.US:
                switch (type) {
                    case UnitType.Altitude:
                        return "ft";
                    case UnitType.Distance:
                        return "ft";
                    case UnitType.ShortDistance:
                        return "ft";
                    case UnitType.LongDistance:
                        return "NM";
                    case UnitType.HorizontalSpeed:
                        return "kt";
                    case UnitType.VerticalSpeed:
                        return "ft/min";
                    case UnitType.WindSpeed:
                        return "kt";
                    case UnitType.Weight:
                        return "lb";
                    case UnitType.Volume:
                        return "gal";
                    case UnitType.Temperature:
                        return "°F";
                }
                break;
        }
        return "";
    },

    /*UnitSystem*/ getUnitSystem: function (/*UnitType*/ type) {
        return unitDictionary[type] || UnitSystem.SI;
    },

    // Used in browser js
    /*string*/ getUnitSystemName: function (/*UnitType*/ type) {
        return Object.keys(UnitSystem)[this.getUnitSystem(type)];
    },

    // Used in browser js
    /*string[]*/ getUnitTypes: function () {
        return Object.keys(UnitType);
    },
}

var unitsHelper = UnitsHelper;
window.UnitType = UnitType;
window.unitsHelper = unitsHelper;
