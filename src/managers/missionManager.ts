import { homeType, missionDataType, TelemetrySummaryModel } from "../Module/models/missionTypes";
import geoHelper from "../utils/geoHelper";

const StringJoin = (s: string, r: string[] = [] )=>{
    r.forEach((v, i) => {
      s = s.replace('%'+(i+1), v)
    })
  return s;
  }

class SanityCheckItem {
    constructor(title: string, description: string, checkFunc: (checkItem: SanityCheckItem) => boolean){
        this.title = title;
        this.description = description;
        this.check = checkFunc;
    }
    title: string;
    description: string;
    check: (checkItem: SanityCheckItem) => boolean;
}

// class MissionCheckModel {
//     constructor(mission: missionDataType){
//         this.waypoints = [];
//         mission.waypoints.forEach(w => {
//             this.waypoints.push( new WayPoint(0, w.command, w.latitude, w.longitude, w.altitude, w.parameter));
//         });
//         this.home = mission.home;
//     }   
//     waypoints: WayPoint[];
//     home: homeType;

// }

export default class MissionManager{
    constructor(mission: missionDataType, telemetrySummary: TelemetrySummaryModel) {
        console.log("mission in MIssionManager", mission);
        console.log("telemetry summary in MIssionManager", telemetrySummary);
        this.mission = mission; // new MissionCheckModel(mission);
        this.telemetrySummary = telemetrySummary;
    };

    mission: missionDataType;
    telemetrySummary: TelemetrySummaryModel;

    isHomeSet = () => {
        return this.mission.home.latitude !== 0 || this.mission.home.longitude !== 0;
    }

    distanceToHome = () => {
        return geoHelper.getDistance(this.telemetrySummary.latitude, this.telemetrySummary.longitude, this.mission.home.latitude, this.mission.home.longitude);
    }

    createCheckList: () => SanityCheckItem[] = () => {
        let isHomeSet = this.isHomeSet();
        let distanceToHome = this.distanceToHome();
        
        let checkList: SanityCheckItem[] = [
            new SanityCheckItem(
                "Home", 
                "\r\n* Home is not set",
                (item: SanityCheckItem) => {
                    return isHomeSet;
                }
            ),
            new SanityCheckItem(
                "Home-aircraft altitude difference", 
                "\r\n* Home altitude differs from aircraft altitude by %1.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet || !this.telemetrySummary.isSittingOnGround) 
                        return true;
                    const diff = Math.abs(this.telemetrySummary.altitude - this.mission.home.altitude);
                    let d = diff;
                    if (distanceToHome > 300)
                        d -= (distanceToHome - 300) / 100;
                    if (d > 5) {
                        item.description = StringJoin(item.description, [UnitsHelper.convertToString(UnitType.Altitude, diff)]);
                        return false;
                    }  
                    return true;
                }
            ),
            new SanityCheckItem(
                "Home distance", 
                "\r\n* Home is %1 far from aircraft.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet || !this.telemetrySummary.isSittingOnGround) 
                        return true;
                    if (distanceToHome > 2000)
                    {
                        item.description = StringJoin(item.description, [UnitsHelper.convertToString(UnitType.LongDistance, distanceToHome)]);
                        return false;
                    }
                    return true;
                }
            ),
            new SanityCheckItem(
                "Waypoint to home distances", 
                "\r\n* \"Waypoint-%2 (%3)\" is %1 away from home.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet) 
                        return true;
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            waypoint: w,
                            distance: geoHelper.getDistance(this.mission.home.latitude, this.mission.home.longitude, w.latitude, w.longitude)    
                        };})
                    .filter((w, i) => w.waypoint.command !== Command.ReturnToLaunch && w.distance > 50000)
                    .sort((a, b ) => a.distance - b.distance);
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, [UnitsHelper.convertToString(UnitType.LongDistance, w.distance), ('' + (w.index + 1)), w.waypoint.command]);
                    });
                    item.description = s;
                    return false;
                }
            ),
            new SanityCheckItem(
                "Track lengths", 
                "\r\n* \"Waypoint-%2 (%3)\" is %1 away from previous waypoint.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet) 
                        return true;
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            waypoint: w,
                            distance: i === 0 ? 0 :
                                     geoHelper.getDistance(this.mission.waypoints[i-1].latitude, this.mission.waypoints[i-1].longitude, w.latitude, w.longitude)    
                        };})
                    .filter((w, i) => w.waypoint.command !== Command.ReturnToLaunch 
                                        && w.distance > 50000
                                        && this.mission.waypoints[i-1].command !== Command.ReturnToLaunch)
                    .sort((a, b ) => a.distance - b.distance);
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, [UnitsHelper.convertToString(UnitType.LongDistance, w.distance), ('' + (w.index + 1)), w.waypoint.command]);
                    });
                    item.description = s;
                    return false;
                }
            ),
            new SanityCheckItem(
                "Mission ceiling altitude", 
                "\r\n* \"Waypoint-%2 (%3)\" has a very high altitude: %1 MSL.",
                (item: SanityCheckItem) => {
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            command: w.command,
                            altitude: w.altitude    
                        };})
                    .filter((w, i) => w.altitude > 5000)
                    .sort((a, b ) => a.altitude - b.altitude);
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, [UnitsHelper.convertToString(UnitType.Altitude, w.altitude), ('' + (w.index + 1)), w.command]);
                    });
                    item.description = s;
                    return false;
                }
            ),
            new SanityCheckItem(
                "Waypoints below home altitude", 
                "\r\n* \"Waypoint-%2 (%3)\" is %1 below home altitude: %4 MSL.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet) 
                        return true;
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            command: w.command,
                            altitude: w.altitude    
                        };})
                    .filter((w, i) => w.command !== Command.ReturnToLaunch && w.altitude < this.mission.home.altitude - 2)
                    .sort((a, b ) => a.altitude - b.altitude);
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, [UnitsHelper.convertToString(UnitType.Altitude, w.altitude - this.mission.home.altitude), ('' + (w.index + 1)), w.command, w.altitude.toString()]);
                    });
                    item.description = s;
                    return false;
                }
            ),
            new SanityCheckItem(
                "Waypoints close to home altitude", 
                "\r\n* \"Waypoint-%2 (%3)\" is %1 close to home altitude: %4 MSL.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet) 
                        return true;
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            command: w.command,
                            altitude: w.altitude,
                            waypoint: w,
                        };})
                    .filter((w, i)  => w.command !== Command.ReturnToLaunch 
                                    && !w.command.startsWith("Vtol")
                                    && !w.command.startsWith("Taxi")
                                    && w.command !== Command.Land
                                    && w.command !== Command.ChuteLand
                                    && (w.index + 1 === this.mission.waypoints.length || this.mission.waypoints[w.index + 1].command !== Command.VtolLand)
                                    && w.altitude >= this.mission.home.altitude - 2
                                    && w.altitude < this.mission.home.altitude + 50)
                    .sort((a, b ) => a.altitude - b.altitude);
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, 
                                        [UnitsHelper.convertToString(UnitType.Altitude, w.altitude - this.mission.home.altitude), 
                                        ('' + (w.index + 1)), 
                                        w.command, 
                                        w.altitude.toString()]);
                    });
                    item.description = s;
                    return false;
                }
            ),
            new SanityCheckItem(
                "Long distance VTOL waypoints", 
                "\r\n* \"Waypoint-%2 (%3)\" requires %1 of VTOL flight.",
                (item: SanityCheckItem) => {
                    if(!isHomeSet) 
                        return true;
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            command: w.command,
                            distance: i === 0 ? 0 :
                                     Math.abs(this.mission.waypoints[i-1].altitude - w.altitude) +
                                     geoHelper.getDistance(this.mission.waypoints[i-1].latitude, this.mission.waypoints[i-1].longitude, w.latitude, w.longitude)    
                        };})
                    .filter((w, i)  => w.command !== Command.VtolSpeedUp
                                    && w.command.startsWith("Vtol")
                                        && w.distance > 100
                                        && this.mission.waypoints[i-1].command !== Command.ReturnToLaunch)
                    .sort((a, b ) => a.distance - b.distance);
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, [UnitsHelper.convertToString(UnitType.LongDistance, w.distance), ('' + (w.index + 1)), w.command]);
                    });
                    item.description = s;
                    return false;
                }
            ),
            new SanityCheckItem(
                "Self jump", 
                "\r\n* \"Waypoint-%1 (Jump)\" can not point to %2.",
                (item: SanityCheckItem) => {
                    var wps = this.mission.waypoints.map((w, i) => {
                        return  {
                            index: i,
                            waypoint: w
                        };})
                    .filter((w, i) => w.waypoint.command === Command.Jump
                                   && ( i === w.waypoint.parameter.jumpWaypointIndex || this.mission.waypoints[w.waypoint.parameter.jumpWaypointIndex].command === Command.Land))
                    
                    if(wps.length === 0)
                        return true;

                    let s = "";
                    wps.forEach(w => {
                        s += StringJoin(item.description, [('' + (w.index + 1)), w.index === w.waypoint.parameter.jumpWaypointIndex ? "itself" : "a land command"]);
                    });
                    item.description = s;
                    return false;
                }
            ),
        ];
        return checkList;
    }

    check: () => string = () => {
        let checkList = this.createCheckList();
        var result = "";
        for (var i = 0; i < checkList.length; i++)
        {
            var item = checkList[i];
            if (!item.check(item))
                result += item.description;
        }
        return result;
    }

}