import { UnitsHelperNew, UnitTypeEnum } from "../../utils/unitsHelperNew";

let PredefinedAirspeedSetPointModel = {
    DefaultSpeed: 0,
    LowSpeed: 1,
    HighSpeed: 2,
    Rush: 3,
}

let PackHelperNew = {
    PackBits(existingValue: number, bitValues: number, startBit: number, bitCount: number) {
        var ones = (65535 >> (16 - bitCount));
        bitValues &= ones; // make sure we have correct number of bits in bitValues;
        existingValue &= ~(ones << startBit); // Reset bits
        existingValue |= bitValues << startBit; // Set bits
        return existingValue;
    },

    UnpackBits(value: number, startBit: number, bitCount: number) {
        var ones = (65535 >> (16 - bitCount));
        return (value >> startBit) & ones;
    }
};

export class WayPointParam {
    private waypoint: WayPointModel;
    valueAsInt: number;
    constructor(waypoint: WayPointModel) {
        this.waypoint = waypoint;
        this.valueAsInt = 0;
    }

    isValid() {
        return Number.isFinite(this.valueAsInt);
    }

    assign(value: number) {
        switch (typeof (value)) {
            case "undefined":
                this.valueAsInt = 0;
                break;
            case "number":
                this.valueAsInt = value;
                break;
            // case "object":
            //     Object.keys(value).forEach((k) => this[k] = value[k]);
            //     break;
        }
        return this;
    }

    assignFrom(value: WayPointParam) {
        this.valueAsInt = value.valueAsInt;
        return this;
    }

    isEqual(p: WayPointParam | null) {
        return p && this.valueAsInt === p.valueAsInt;
    }

    get ushort0() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 0, 16);
    }

    set ushort0(value/*: number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 0, 16);
    }

    get ushort1() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 16, 16);
    }

    set ushort1(value/*: number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 16, 16);
    }

    get byte0() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 0, 8);
    }

    set byte0(value/*: number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 0, 8);
    }

    get byte1() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 8, 8);
    }

    set byte1(value/*: number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 8, 8);
    }

    get byte2() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 16, 8);
    }

    set byte2(value/*: number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 16, 8);
    }

    get byte3() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 24, 8);
    }

    set byte3(value/*: number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 24, 8);
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
        return PackHelperNew.UnpackBits(this.valueAsInt, 15, 1) > 0;
    }

    set followTrack(value/*: boolean*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value ? 1 : 0, 15, 1);
    }

    get isLoiterClockwise() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 14, 1) > 0;
    }

    set isLoiterClockwise(value/*: boolean*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value ? 1 : 0, 14, 1);
    }

    get loiterRadius() {
        return PackHelperNew.UnpackBits(this.valueAsInt, 0, 14);
    }

    set loiterRadius(value/*:number*/) {
        this.valueAsInt = PackHelperNew.PackBits(this.valueAsInt, value, 0, 14);
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
        if (this.loiterRadius > 1) cwSt += UnitsHelperNew.convertToString(UnitTypeEnum.Distance, this.loiterRadius) + " ";
        var navSt = "";
        switch (this.airspeedSetPoint) {
            case PredefinedAirspeedSetPointModel.DefaultSpeed:
                navSt = "Ds ";
                break; // Default speed
            case PredefinedAirspeedSetPointModel.LowSpeed:
                navSt = "Ls ";
                break; // Low speed
            case PredefinedAirspeedSetPointModel.HighSpeed:
                navSt = "Hs ";
                break; // High speed
            case PredefinedAirspeedSetPointModel.Rush:
                navSt = "Ru ";
                break; // Rush
            default:
                navSt = UnitsHelperNew.convertToString(UnitTypeEnum.HorizontalSpeed, this.airspeedSetPoint) + "m/s ";
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
                return UnitsHelperNew.convertToString(UnitTypeEnum.TimePrecise, this.vtolHoverTime);
            case Command.VtolTakeOff:
                return navSt + "Th" + this.vtolTakeOffThrottle + "%";
            default:
                return "-";
        }
    }
}

export class WayPointModel {
    index: number;
    command: string;
    latitude: number;
    longitude: number;
    altitude: number;
    parameter: WayPointParam;

    constructor(index: number, command: string, latitude: number, longitude: number, altitude: number, parameter:number) {
        this.index = index;
        this.command = command;
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude;
        this.parameter = new WayPointParam(this);
        this.parameter.assign(parameter);
    }

    get coordinates() {
        return {latitude: this.latitude, longitude: this.longitude, altitude: this.altitude};
    }
};

export class WayPointCommand {
    index: number;
    data: WayPointModel;
    loiterRadius!: number;
    runwayWidth!: number;
    name!: string;
    isLoiter!: boolean;
    isLandingApproach!: boolean;
    isLanding!: boolean;
    isVtolTakeOff!: boolean;
    isVtolLand!: boolean;
    isVtolSpeedUp!: boolean;
    isLandingTaxi!: boolean;
    isChuteLand!: boolean;
    clockwise!: boolean;
    isTakeoff!: boolean;
    isTaxi!: boolean;
    isTaxiSpeedUp!: boolean;
    
    static fromWaypoint = (w: any) => { 
        return new WayPointCommand(w.index, w.command, w.latitude, w.longitude, w.altitude, w.parameter)
    };
    
    constructor(index: number, command: string, latitude: number, longitude: number, altitude: number, parameter: number) {
        this.index = index;
        this.data = new WayPointModel(index, command, latitude, longitude, altitude, parameter);
        this.updateProperties();
    }

    updateProperties() {
        this.runwayWidth = ConfigInfo.RunwayWidth;
        this.loiterRadius = ConfigInfo.LoiterRadius;
        var command = this.data.command;
        this.name = command;
        this.isLoiter = command.startsWith("Loiter") || command === Command.ReturnToLaunch;
        this.isLandingApproach = (command === Command.ApproachLanding);
        this.isLanding = (command === Command.Land);
        this.isLandingTaxi = (command === Command.TaxiStop);
        this.isVtolTakeOff = (command === Command.VtolTakeOff);
        this.isVtolSpeedUp = (command === Command.VtolSpeedUp);
        this.isVtolLand = (command === Command.VtolLand);
        this.isChuteLand = (command === Command.ChuteLand);

        if (this.isLoiter || this.isLandingApproach)
            this.clockwise = this.data.parameter.isLoiterClockwise;
        if (this.isLoiter && this.data.parameter.loiterRadius > 10)
            this.loiterRadius = this.data.parameter.loiterRadius;
            
        this.isTakeoff = (command === Command.TakeOff);

        this.isTaxi = (command === Command.TaxiToPoint);

        this.isTaxiSpeedUp = (command === Command.TaxiSpeedUp);
    }
};
