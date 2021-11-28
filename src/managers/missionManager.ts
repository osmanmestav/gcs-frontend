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

export default class MissionManager{
    constructor(mission: any, telemetrySummary: any) {
        console.log("mission in MIssionManager", mission);
        console.log("telemetry summary in MIssionManager", telemetrySummary);
        this.mission = mission;
        this.telemetrySummary = telemetrySummary;
    };

    mission: any;
    telemetrySummary: any;

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