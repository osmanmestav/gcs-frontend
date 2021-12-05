// // eslint-disable-next-line import/no-webpack-loader-syntax
// import { UnitsHelper } from "exports-loader?exports=UnitsHelper!./unitsHelper";
// // eslint-disable-next-line import/no-webpack-loader-syntax
// import { UnitType } from "exports-loader?exports=UnitType!./unitsHelper";
// // eslint-disable-next-line import/no-webpack-loader-syntax
// import { Command } from "exports-loader?exports=Command!./types";
// // eslint-disable-next-line import/no-webpack-loader-syntax
// import { ConfigInfo } from "exports-loader?exports=ConfigInfo!./configInfo";

let PredefinedAirspeedSetPoint = {
    DefaultSpeed: 0,
    LowSpeed: 1,
    HighSpeed: 2,
    Rush: 3,
}

let PackHelper = {
    PackBits(existingValue/*: number*/, bitValues/*: number*/, startBit/*: number*/, bitCount/*: number*/) {
        var ones = (65535 >> (16 - bitCount));
        bitValues &= ones; // make sure we have correct number of bits in bitValues;
        existingValue &= ~(ones << startBit); // Reset bits
        existingValue |= bitValues << startBit; // Set bits
        return existingValue;
    },

    UnpackBits(value/*: number*/, startBit/*: number*/, bitCount/*: number*/) {
        var ones = (65535 >> (16 - bitCount));
        return (value >> startBit) & ones;
    }
};

class NavigationCommandParam {
    //private waypoint: Waypoint;
    //valueAsInt: number;
    constructor(waypoint/*: Waypoint*/) {
        this.waypoint = waypoint;
        this.valueAsInt = 0;
    }

    isValid() {
        return Number.isFinite(this.valueAsInt);
    }

    assign(value/*: number||object*/) {
        switch (typeof (value)) {
            case "undefined":
                this.valueAsInt = 0;
                break;
            case "number":
                this.valueAsInt = value;
                break;
            case "object":
                Object.keys(value).forEach((k) => this[k] = value[k]);
                break;
        }
        return this;
    }

    assignFrom(value/*: NavigationCommandParam*/) {
        this.valueAsInt = value.valueAsInt;
        return this;
    }

    isEqual(p/*: NavigationCommandParam|null*/) {
        return p && this.valueAsInt === p.valueAsInt;
    }

    get ushort0() {
        return PackHelper.UnpackBits(this.valueAsInt, 0, 16);
    }

    set ushort0(value/*: number*/) {
        PackHelper.PackBits(this.valueAsInt, 0, 16, value);
    }

    get ushort1() {
        return PackHelper.UnpackBits(this.valueAsInt, 16, 16);
    }

    set ushort1(value/*: number*/) {
        PackHelper.PackBits(this.valueAsInt, 16, 16, value);
    }

    get byte0() {
        return PackHelper.UnpackBits(this.valueAsInt, 0, 8);
    }

    set byte0(value/*: number*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value, 0, 8);
    }

    get byte1() {
        return PackHelper.UnpackBits(this.valueAsInt, 8, 8);
    }

    set byte1(value/*: number*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value, 8, 8);
    }

    get byte2() {
        return PackHelper.UnpackBits(this.valueAsInt, 16, 8);
    }

    set byte2(value/*: number*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value, 16, 8);
    }

    get byte3() {
        return PackHelper.UnpackBits(this.valueAsInt, 24, 8);
    }

    set byte3(value/*: number*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value, 24, 8);
    }

    get taxiThrottle() {
        return this.valueAsInt;
    }

    set taxiThrottle(value/*: number*/) {
        this.valueAsInt = value;
    }

    get takeOffTimeForMaxThrottle() {
        return this.valueAsInt;
    }

    set takeOffTimeForMaxThrottle(value/*:number*/) {
        this.valueAsInt = value;
    }

    get landingLongitudinalTolerance() {
        return this.valueAsInt;
    }

    set landingLongitudinalTolerance(value/*:number*/) {
        this.valueAsInt = value;
    }

    get flyByGCSDirection() {
        return this.valueAsInt;
    }

    set flyByGCSDirection(value/*:number*/) {
        this.valueAsInt = value;
    }

    get followTrack() {
        return PackHelper.UnpackBits(this.valueAsInt, 15, 1) > 0;
    }

    set followTrack(value/*: boolean*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value ? 1 : 0, 15, 1);
    }

    get isLoiterClockwise() {
        return PackHelper.UnpackBits(this.valueAsInt, 14, 1) > 0;
    }

    set isLoiterClockwise(value/*: boolean*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value ? 1 : 0, 14, 1);
    }

    get loiterRadius() {
        return PackHelper.UnpackBits(this.valueAsInt, 0, 14);
    }

    set loiterRadius(value/*:number*/) {
        this.valueAsInt = PackHelper.PackBits(this.valueAsInt, value, 0, 14);
    }

    get loiterTurns() {
        return this.byte2;
    }

    set loiterTurns(value/*:number*/) {
        this.byte2 = value;
    }

    get loiterMinutes() {
        return this.byte2;
    }

    set loiterMinutes(value/*:number*/) {
        this.byte2 = value;
    }

    get loiterExitAngle() {
        return this.byte3 * 360 / 256.0;
    }

    set loiterExitAngle(value/*:number*/) {
        this.byte3 = value * 256 / 360;
    }

    get airspeedSetPoint() {
        return this.byte3;
    }

    set airspeedSetPoint(value/*:number*/) {
        this.byte3 = value;
    }

    get jumpWaypointIndex() {
        return this.ushort0;
    }

    set jumpWaypointIndex(value/*:number*/) {
        this.ushort0 = value;
    }

    get vtolHoverTime() {
        return this.ushort0;
    }

    set vtolHoverTime(value/*:number*/) {
        this.ushort0 = value;
    }

    get vtolTakeOffThrottle() {
        return this.ushort0;
    }

    set vtolTakeOffThrottle(value/*:number*/) {
        this.ushort0 = value;
    }

    toString() {
        var cwSt = this.isLoiterClockwise ? "Cw " : "Ccw ";
        if (this.loiterRadius > 1) cwSt += UnitsHelper.convertToString(UnitType.Distance, this.loiterRadius) + " ";
        var navSt = "";
        switch (this.airspeedSetPoint) {
            case PredefinedAirspeedSetPoint.DefaultSpeed:
                navSt = "Ds ";
                break; // Default speed
            case PredefinedAirspeedSetPoint.LowSpeed:
                navSt = "Ls ";
                break; // Low speed
            case PredefinedAirspeedSetPoint.HighSpeed:
                navSt = "Hs ";
                break; // High speed
            case PredefinedAirspeedSetPoint.Rush:
                navSt = "Ru ";
                break; // Rush
            default:
                navSt = UnitsHelper.convertToString(UnitType.HorizontalSpeed, this.airspeedSetPoint) + "m/s ";
                break;
        }
        var trkSt = "";
        if (this.followTrack) navSt += (trkSt = "Tr ");
        switch (this.waypoint.command) {
            case Command.Jump:
                return (
                    this.jumpWaypointIndex >= 0 
                                    // && this.waypoint.mission.waypointCount 
                                    // && this.jumpWaypointIndex < this.waypoint.mission.waypointCount
                                    ) 
                        // eslint-disable-next-line no-useless-concat
                        ? (this.jumpWaypointIndex + 1) + "-" + "Command" //Command[this.waypoint.mission.waypoints[this.jumpWaypointIndex].command] 
                        : "-";
            //case Command.Jump: return (this.jumpWaypointIndex + 1).toFixed(0);
            case Command.WayPoint:
                return navSt;
            case Command.ApproachLanding:
                return trkSt + cwSt;
            case Command.LoiterAltitude:
            case Command.LoiterUnlimited:
            case Command.ReturnToLaunch:
                return navSt + cwSt;
            case Command.LoiterTime:
                return navSt + cwSt + this.loiterMinutes.toFixed(0) + "m";
            case Command.LoiterTurns:
                return navSt + cwSt + this.loiterTurns.toFixed(0) + "t";
            case Command.VtolHoverTime:
                return UnitsHelper.convertToString(UnitType.TimePrecise, this.vtolHoverTime);
            case Command.VtolTakeOff:
                return navSt + "Th" + this.vtolTakeOffThrottle + "%";
            default:
                return "-";
        }
    }
}

class WayPoint {
    constructor(index, command, latitude, longitude, altitude, parameter) {
        this.index = index;
        this.command = command;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.parameter = new NavigationCommandParam(this);
        this.parameter.assign(parameter);
    }

    get coordinates() {
        return {latitude: this.latitude, longitude: this.longitude, altitude: this.altitude};
    }
};

class CommandExpanded {
    /*
        public int index;
        public WayPoint data;
        public string name;
        public bool isLoiter, clockwise, isLandingApproach, isLanding, isLandingTaxi, isTakeoff, isTaxi, isTaxiSpeedUp, isVtolTakeOff, isVtolSpeedUp, isVtolLand, isChuteLand;
        public float loiterRadius, runwayWidth;
    */
    constructor(index, /*Command */command, /*Decimal */latitude, /*Decimal */longitude, /*float */altitude, /*int */parameter) {
        if (typeof (parameter) === "number")
            parameter = new NavigationCommandParam(parameter);
        this.index = index;
        this.data = new WayPoint(index, command, latitude, longitude, altitude, parameter);
        this.updateProperties();
    }

    updateProperties() {
        this.runwayWidth = ConfigInfo.RunwayWidth;
        this.loiterRadius = ConfigInfo.LoiterRadius;
        var command = this.data.command;
        this.name = command;
        this.isLoiter = command.startsWith("Loiter") || command === Command.ReturnToLaunch;
        this.isLandingApproach = (command == Command.ApproachLanding);
        this.isLanding = (command == Command.Land);
        this.isLandingTaxi = (command == Command.TaxiStop);
        this.isVtolTakeOff = (command == Command.VtolTakeOff);
        this.isVtolSpeedUp = (command == Command.VtolSpeedUp);
        this.isVtolLand = (command == Command.VtolLand);
        this.isChuteLand = (command == Command.ChuteLand);

        if (this.isLoiter || this.isLandingApproach)
            this.clockwise = this.data.parameter.isLoiterClockwise;
        if (this.isLoiter && this.data.parameter.loiterRadius > 10)
            this.loiterRadius = this.data.parameter.loiterRadius;

        this.isTakeoff = (command == Command.TakeOff);

        this.isTaxi = (command == Command.TaxiToPoint);

        this.isTaxiSpeedUp = (command == Command.TaxiSpeedUp);
    }
};

CommandExpanded.fromWaypoint = (w) => (new CommandExpanded(w.index, w.command, w.latitude, w.longitude, w.altitude, w.parameter));
