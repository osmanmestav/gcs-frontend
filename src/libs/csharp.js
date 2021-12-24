var csharp = {
    aircrafts: {},
    selectedAircraft: {},
    mission: {
        home: {},
        waypoints: [],
        geoFence: null, /*{ isActive, isVisible, minAltitude, maxAltitude, returnPoint: {}, points:[] }*/
        failsafe: {
            /**
             {"type":1,"wayPointIndex":2}
             Type
             1=Return To Launch
             2=Jump
             */
            /*longAction: {type: 1}, // {"type": 1, "wayPointIndex": 2}, if(type==2) wayPointIndex = waypoints.index
            rescueOnLossOfControl: false,
            blockRCCommandSwitch: false,
            lossOfRCACtionChoice: 0, // 2 Enable long action, 1 Enable short action, 0 Disable
            lossOfGCSActionChoice: 0, // // 2 Enable long action, 1 Enable short action, 0 Disable
            climbRateToleranceForRescue: 10,
            timeShortActionRC: 1, //Seconds
            timeShortActionGPS: 2, //Seconds
            timeShortActionGCS: 10, //Seconds
            timeLongAction: 300, //Seconds*/

        }
    },
    CommandSourceType: {
        0: "NONE",
        1: "INITIAL",
        2: "MISSION",
        3: "IDLE",
        4: "RC",
        5: "INSTANT",
        6: "GEOFENCE",
        7: "FAILSAFE",
        8: "FAILSAFEFLIGHTCMDONGROUND",
        9: "FAILSAFERESCUE",
        10: "FAILSAFEGPSLOSS",
        11: "FAILSAFEGCSLOSS",
        12: "FAILSAFERCLOSS",
    },
    telemetrySummaries: {},
    selectedWaypointIndices: [],
    showMessage(msg) {
        alert(msg);
    },
    playAlarm(message) {
        FlightSummary.addToSummary(SummaryEntryType.Message, "Alarm: " + message);
    },
    pauseAlarm() {
        FlightSummary.addToSummary(SummaryEntryType.Message, "Alarm stopped");
    },
    indicatorStatusChanged(name, value) {
        let category = SummaryEntryType.Message;
        if (value == "Failed" || value == 1) category = SummaryEntryType.Error;
        if (value == "Disabled" || value == 0) category = SummaryEntryType.Warning;
        if (value == "Unhealthy" || value == 2) category = SummaryEntryType.Warning;
        FlightSummary.addToSummary(category, "Status changed: " + name + "=" + value);
    },
    getCommands() {
        return ["Waypoint", "Loiter", "Hover", "Taxi", "Takeoff-Runway", "Takeoff-Launch", "Takeoff-Vtol", "Land-Runway", "Land-Vtol", "Land-Chute"];
    },
    setMapReady() {
        this.mapReady = true;
        window.dispatchEvent(new CustomEvent('mapReady'));
    },

    prepareTelemetrySummary(aircraftState) {
        return {
            aircraftId: aircraftState.aircraftId,
            altitude: aircraftState.altitude,
            latitude: aircraftState.latitude,
            longitude: aircraftState.longitude,
            isSittingOnGround: aircraftState.travelStatus === 0,
        };
    },

    async addAircraft(aircraftState) {
        let aircraftId = aircraftState.aircraftId;
        this.aircrafts[aircraftId] = {aircraftId};
        this.telemetrySummaries[aircraftState.aircraftId] = Object.assign({}, this.prepareTelemetrySummary(aircraftState));
        window.dispatchEvent(new CustomEvent('AircraftAdded', {detail: aircraftId}));
        if (!this.selectedAircraft || !this.selectedAircraft.aircraftId)
            this.selectAircraft(aircraftState);
    },
    async removeAircraftById(aircraftId) {
        try {
            delete this.aircrafts[aircraftId];
            delete this.telemetrySummaries[aircraftId];
            if (this.selectedAircraft && this.selectedAircraft.aircraftId === aircraftId){
                this.selectedAircraft = null;
                this.clearWaypoints("aircraftRemoval");
                this.clearGeoFence();
            }
                
            window.dispatchEvent(new CustomEvent('AircraftRemoved', {detail: aircraftId}));
        } catch (err) {
            console.log(err);
        }
    },
    async removeAircraftByCertificateName(aircraftCertificateName) {
        const aircraft = Object.values(this.aircrafts).filter(x=> x.aircraftCertificateName === aircraftCertificateName)[0];
        if(aircraft === undefined)
            return;
        
        const aircraftId = aircraft.aircraftId;
        this.removeAircraftById(aircraftId);
    },
    async updateAircraft(aircraftState) {
        if (!this.mapReady) return;
        try {
            let aircraft = this.aircrafts[aircraftState.aircraftId];
            if (!aircraft) {
                this.addAircraft(aircraftState);
                aircraft = this.aircrafts[aircraftState.aircraftId];
            }
            this.telemetrySummaries[aircraftState.aircraftId] = Object.assign({}, this.prepareTelemetrySummary(aircraftState));
            Object.assign(aircraft, aircraftState);
            window.dispatchEvent(new CustomEvent('AircraftChanged', {detail: aircraft}));
        } catch (err) {
            console.log(err);
        }
    },
    async uploadMissionToAllAircrafts() {
        FlightSummary.addToSummary(SummaryEntryType.Warning, "********************************************");
        FlightSummary.addToSummary(SummaryEntryType.Warning, "  Uploading mission to all aircrafts");
        FlightSummary.addToSummary(SummaryEntryType.Warning, "********************************************");

        var failedAircrafts = "";
        for (const aircraft of this.aircrafts) {
            var result = await this.uploadMissionToAircraft(aircraft);
            if (!result) failedAircrafts += "\r\n" + aircraftName;
        }
        ;
        if (failedAircrafts == "")
            this.showMessage("Mission upload was successful!", "Congrats!", MessageBoxButtons.OK, MessageBoxIcon.Information);
        else
            this.showMessage("Mission upload was failed for: " + failedAircrafts, "Hey!", MessageBoxButtons.OK, MessageBoxIcon.Error);
    },

    async selectAircraft(aircraftState) {
        let aircraftId = aircraftState.aircraftId;
        try {
            this.selectedAircraft = this.aircrafts[aircraftId];
            window.dispatchEvent(new CustomEvent('AircraftSelectionChanged', {detail: aircraftId}));
        } catch (err) {
            console.log(err);
        }
    },

    // invoked by plane.js on dropdown box selection changed - no need to invoke AircraftSelectionChanged.
    aircraftSelectionChanged(aircraftId) {
        this.selectedAircraft = this.aircrafts[aircraftId];
        this.downloadMission();
    },

    async downloadMission() {
        console.log("selected aircraft in download mission: ", this.selectedAircraft);
        return this.downloadMissionFromAircraft(this.selectedAircraft);
    },

    async downloadMissionFromAircraft(aircraft) {
        var aircraftName = aircraft.aircraftName + " (" + aircraft.aircraftId + ")";
        if (aircraft.upLinkStatus != ConnectionStatus.Healthy) {
            FlightSummary.addToSummary(SummaryEntryType.Error, "Aircraft is not connected, cannot download mission: " + aircraftName);
            return false;
        } else {
            let req = {
                aircraftId: aircraft.aircraftId,
                aircraftName: aircraft.aircraftName,
                aircraftCertificateName: aircraft.aircraftCertificateName,
                command: "DownloadMission"
            };
            window.dispatchEvent(new CustomEvent('CommandRequest', {detail: req}));
            FlightSummary.addToSummary(SummaryEntryType.Message, "Mission download requested: " + aircraftName);
            return true;
        }
    },

    async uploadMission() {
        return this.uploadMissionToAircraft(this.selectedAircraft);
    },
    async uploadMissionToAircraft(aircraft) {
        var aircraftName = aircraft.aircraftName + " (" + aircraft.aircraftId + ")";
        if (aircraft.upLinkStatus != ConnectionStatus.Healthy) {
            FlightSummary.addToSummary(SummaryEntryType.Error, "Aircraft is not connected, cannot upload mission: " + aircraftName);
            return false;
        } else {
            let req = {
                aircraftId: aircraft.aircraftId,
                aircraftName: aircraft.aircraftName,
                aircraftCertificateName: aircraft.aircraftCertificateName,
                command: "UploadMission",
                mission: {
                    mission: {
                        home: this.mission.home,
                        waypoints: this.mission.waypoints.map(w => ({
                            ...w,
                            command: CommandLookup[w.command],
                            parameter: w.parameter.valueAsInt
                        }))
                    },
                    geoFence: this.mission.geoFence,
                    failsafe: this.mission.failsafe
                }

            };
            window.dispatchEvent(new CustomEvent('CommandRequest', {detail: req}));
            FlightSummary.addToSummary(SummaryEntryType.Message, "Mission upload requested: " + aircraftName);
            return true;
        }
    },

    async receivedMission(mission, missionUpdateOrigin = 'not-set') {
        // console.log(isFromDownload)
        await this.clearWaypoints(missionUpdateOrigin);
        if (mission.mission.waypoints == null) {
            return;
        }
        for (var i = 0; i < mission.mission.waypoints.length; i++) {

            let w = mission.mission.waypoints[i];
            let wp = new WayPoint(i, Command[w.command], w.latitude, w.longitude, w.altitude, w.parameter);
            this.mission.waypoints.push(wp);
            wp.missionUpdateOrigin = missionUpdateOrigin;

            window.dispatchEvent(new CustomEvent('WaypointAdded', {detail: wp}));
        }

        this.mission.home = mission.mission.home;
        this.mission.home.missionUpdateOrigin = missionUpdateOrigin;
        this.mission.geoFence = mission.geoFence;
        this.mission.geoFence.missionUpdateOrigin = missionUpdateOrigin;
        this.mission.failsafe = mission.failSafe;
        window.dispatchEvent(new CustomEvent('HomeChanged', {detail: this.mission.home}));
        window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));

        if (missionUpdateOrigin === 'mission-download')
            window.dispatchEvent(new CustomEvent('DownloadMission', {detail: this.mission}));

    },

    async buildScanPath() {
        console.log("csharp.buildScanPath: Not implemented");
    },

    async buildAndUploadScanMissionToAllAircrafts() {
        console.log("csharp.buildAndUploadScanMissionToAllAircrafts: Not implemented");
        /*
        operation.Post(delegate (object arg)
        {
            var aircrafts = GCSConnection.Instance.GetAircrafts().Where(a => a.AircraftId != 0).Select(a => new { a.AircraftId, a.AircraftName, a.LinkHealth.upLinkStatus }).ToArray();
            if (aircrafts.Length==0)
            {
                MessageBox.Show("You need to have at least 1 aircraft.");
                return;
            }

            // Check number of input points
            var allWaypoints = DataSets.flightPlanningDataSet.GetFlightCommands();
            var launchCommand = allWaypoints.First();
            if (launchCommand.command != Command.Launch)
            {
                MessageBox.Show("First waypoint needs to be Launch", "Hey!", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            if (allWaypoints.Count(p => p.command == Command.WayPoint) < 4)
            {
                MessageBox.Show("You need to have at least 4 regular waypoints.", "Hey!", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            var approachCommand = allWaypoints.FirstOrDefault(w => w.command == Command.ApproachLanding);
            if (approachCommand.command!= Command.ApproachLanding)
            {
                MessageBox.Show("You need to have a Landing method.", "Hey!", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            var spacingDirection = approachCommand.WayPoint.param.loiterExitAngle + 90;


            // Input scan line distance
            double distance = 40;
            var dialogResult = InputBox.Show("Input value", "Scan line distance ({0}): ", ref distance, UnitType.Distance, delegate (double v) {
                if (v < 30) return "Scan line distance is too small";
                return null;
            });
            if (dialogResult != DialogResult.OK)
                return;

            FlightPlanner.instance.AddToSummary(SummaryEntryType.Warning, "********************************************");
            FlightPlanner.instance.AddToSummary(SummaryEntryType.Warning, "  Building and uploading scan mission to all aircrafts");
            FlightPlanner.instance.AddToSummary(SummaryEntryType.Warning, "********************************************");

            var polygon = allWaypoints.Select((w, i) => new { index = i, waypoint = w.WayPoint }).Where(w => w.waypoint.command == Command.WayPoint).Take(4).ToArray();
            var polygonIndices = polygon.Select(p => p.index).ToArray();
            var pointA = polygon[0].waypoint.coordinates;
            var pointB = polygon[1].waypoint.coordinates;
            var scanLines = FlightPlanner.BuildScanPath(pointA, pointB, polygon[2].waypoint.coordinates, polygon[3].waypoint.coordinates, distance);
            var scanLineExtentionBearing = GeoHelper.getBearing((double)pointB.latitude, (double)pointB.longitude, (double)pointA.latitude, (double)pointA.longitude);
            var scanLineExtentionLength = ConfigInfo.LoiterRadius+40;
            var numTours = 1 + (scanLines.Length - 2) / 4;
            var scanLinesPerAircraft = 4 * (1 + (numTours - 1) / aircrafts.Length);

            FlightPlanner.instance.ClearWaypoints();
            var homePoint = DataSets.flightPlanningDataSet.GetHomePoint();
            var failedAircrafts = "";
            for(var index=0;index<aircrafts.Length; index++)
            {
                var aircraft = aircrafts[index];
                var aircraftName = aircraft.AircraftName + " (" + aircraft.AircraftId + ")";
                if (aircraft.upLinkStatus != ConnectionStatus.Healthy)
                {
                    failedAircrafts += "\r\n" + aircraftName;
                    FlightPlanner.instance.AddToSummary(SummaryEntryType.Error, "Aircraft is not connected, cannot upload mission: " + aircraftName);
                }
                else
                {
                    // Build mission for current aircraft
                    var wps = new List<FlightCommand>();
                    for (var i = 0; i < polygonIndices.First(); i++)
                    {
                        var w = allWaypoints[i];
                        w.WayPoint.coordinates = GeoHelper.getDestination(w.WayPoint.coordinates, spacingDirection, index * distance);
                        wps.Add(w);
                    }
                    for (var i = index * scanLinesPerAircraft; i < (index + 1) * scanLinesPerAircraft && i < scanLines.Length; i++)
                        wps.Add(new FlightCommand(Command.WayPoint, scanLines[i].latitude, scanLines[i].longitude, scanLines[i].altitude, new NavigationCommandParam() { followTrack = true }));
                    if (wps.Any())
                    {
                        var lastCr = wps.Last().WayPoint.coordinates;
                        lastCr = GeoHelper.getDestination(lastCr, scanLineExtentionBearing, scanLineExtentionLength);
                        wps.Add(new FlightCommand(Command.LoiterUnlimited, lastCr.latitude, lastCr.longitude, lastCr.altitude, new NavigationCommandParam() { followTrack = true }));
                    }
                    for (var i = polygonIndices.Last() + 1; i < allWaypoints.Length; i++)
                    {
                        var w = allWaypoints[i];
                        w.WayPoint.coordinates = GeoHelper.getDestination(w.WayPoint.coordinates, spacingDirection, index * distance);
                        wps.Add(w);
                    }
                    DataSets.flightPlanningDataSet.wayPointsDataTable.BeginLoadData();
                    DataSets.flightPlanningDataSet.wayPointsDataTable.Clear();
                    for (var i=0;i<wps.Count;i++) {
                        var row = DataSets.flightPlanningDataSet.wayPointsDataTable.NewRow();
                        row["Index"] = i;
                        wps[i].WayPoint.ToDataRow(row);
                        DataSets.flightPlanningDataSet.wayPointsDataTable.Rows.Add(row);
                    }
                    DataSets.flightPlanningDataSet.wayPointsDataTable.EndLoadData();
                    Logger.Instance.OutputDataSet("swarmFlightPlan", DataSets.flightPlanningDataSet, aircraft.AircraftName);
                    string message;
                    var result = Connection.GCSConnection.Instance.UploadMissionToAircraftSilently(aircraft.AircraftId, out message);
                    if (!result)
                    {
                        Thread.Sleep(1000);
                        Connection.GCSConnection.Instance.UploadMissionToAircraftSilently(aircraft.AircraftId, out message);
                    }
                    if (!result) failedAircrafts += "\r\n" + aircraftName;
                    FlightPlanner.instance.AddToSummary(result ? SummaryEntryType.Message : SummaryEntryType.Error, message);
                }
            }
            if (failedAircrafts == "")
                MessageBox.Show("Mission upload was successful!", "Congrats!", MessageBoxButtons.OK, MessageBoxIcon.Information);
            else
                MessageBox.Show("Mission upload was failed for: " + failedAircrafts, "Hey!", MessageBoxButtons.OK, MessageBoxIcon.Error);

            FlightPlanner.instance.DownloadFlightPlan();
        }, null);
        */
    },

    startMission() {
        let req = {
            aircraftId: this.selectedAircraft.aircraftId,
            aircraftName: this.selectedAircraft.aircraftName,
            aircraftCertificateName: this.selectedAircraft.aircraftCertificateName,
            command: "StartMission",
        }
        window.dispatchEvent(new CustomEvent('CommandRequest', {detail: req}));
    },

    async startAllMissions() {
        console.log("csharp.calibrateAllAirspeedSensors: Not implemented");
        /*
        operation.Post(delegate (object arg)
        {
            string message;
            var result = Connection.GCSConnection.Instance.StartMissionForAllAircrafts(out message);
            FlightPlanner.instance.AddToSummary(result ? SummaryEntryType.Message : SummaryEntryType.Error, message);
        }, null);
        */
        /*var packet = new GCSPacket() { type = GCSPacketType.ExecuteCommand };
            packet.command.flightCommand.command = Command.None;
            return Request(packet).HasValue;*/
    },

    async stopAllMissions() {
        console.log("csharp.calibrateAllAirspeedSensors: Not implemented");
        /*
        operation.Post(delegate (object arg)
        {
            if (MessageBox.Show("Are you sure you want to stop all aircrafts?", "Hey!", MessageBoxButtons.YesNo) == DialogResult.Yes)
            {
                FlightPlanner.instance.AddToSummary(SummaryEntryType.Message, "Sitting all aircrafts");
                Connection.GCSConnection.Instance.SitAllAircrafts();
            }
        }, null);
        */
    },

    async calibrateAllAirspeedSensors() {
        console.log("csharp.calibrateAllAirspeedSensors: Not implemented");
    },

    async setHome(latitude, longitude, altitude) {
        this.mission.home = {latitude, longitude, altitude};
        window.dispatchEvent(new CustomEvent('HomeChanged', {detail: this.mission.home}));
    },

    async changeGeoFencePoint(index, latitude, longitude) {
        try {
            if (!this.mission.geoFence.points[index])
                throw "Invalid index";
            var p = this.mission.geoFence.points[index];
            p.latitude = latitude;
            p.longitude = longitude;
            window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));
        } catch (err) {
            console.log(err);
        }
    },

    async deleteGeoFencePoint(index) {
        try {
            if (!this.mission.geoFence.points[index])
                throw "Invalid index";
            this.mission.geoFence.points.splice(index, 1)
            window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));
        } catch (err) {
            console.log(err);
        }
    },

    async changeGeoFenceReturn(latitude, longitude) {
        try {
            this.mission.geoFence.returnPoint = {latitude, longitude};
            window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));
        } catch (err) {
            console.log(err);
        }
    },

    async addGeoFence(latitude, longitude, altitude) {
        try {
            this.mission.geoFence = {isActive: false, isVisible: true};
            this.mission.geoFence.returnPoint = {latitude, longitude};
            this.mission.geoFence.minAltitude = altitude + 50;
            this.mission.geoFence.maxAltitude = altitude + 500;
            this.mission.geoFence.points = [
                GeoHelper.getDestination(latitude, longitude, 45, 2500),
                GeoHelper.getDestination(latitude, longitude, -45, 2500),
                GeoHelper.getDestination(latitude, longitude, -135, 2500),
                GeoHelper.getDestination(latitude, longitude, 135, 2500)
            ].map(c => ({latitude: c.latitude, longitude: c.longitude}));
            window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));
        } catch (err) {
            console.log(err);
        }
    },

    async addGeoFencePoint(index, latitude, longitude) {
        try {
            if (index == this.mission.geoFence.points.length)
                index = 0;
            if (!this.mission.geoFence.points[index])
                throw "Invalid index.";
            this.mission.geoFence.points.splice(index, 0, {latitude, longitude});
            window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));
        } catch (err) {
            console.log(err);
        }
    },

    async setMapAltitude(aircraftId, mapAltitude) {
        try {
            this.aircrafts[aircraftId].terrainMSL = mapAltitude;
        } catch (err) {
            console.log(err);
        }
    },

    calculateRunwayLanding(latitude, longitude, altitude, landingLoiterAltitude, isLoiterClockwise, landingDirection, halfRunwayLength) {
        var descendAltitude = landingLoiterAltitude - altitude;
        var loiterRadius = ConfigInfo.LoiterRadius;
        var descendAngleStart = GeoHelper.toRadians(ConfigInfo.LandingDescendAngleStart);
        var descendAngleEnd = GeoHelper.toRadians(ConfigInfo.LandingDescendAngleEnd);
        var loiterPointDistance = 2 * descendAltitude / (descendAngleStart + descendAngleEnd);
        var loiterPointAngle = GeoHelper.toDegrees(Math.atan2(loiterRadius, loiterPointDistance));

        var landingPoint = {latitude, longitude, altitude};

        var loiterDirection = (isLoiterClockwise ? -1 : 1);
        var loiterPoint = GeoHelper.getDestination(landingPoint.latitude, landingPoint.longitude, landingDirection + 180 + loiterDirection * loiterPointAngle, Math.sqrt(loiterRadius * loiterRadius + loiterPointDistance * loiterPointDistance));
        loiterPoint.altitude = landingPoint.altitude;
        var exitPoint = GeoHelper.getDestination(landingPoint.latitude, landingPoint.longitude, landingDirection, halfRunwayLength);
        exitPoint.altitude = landingPoint.altitude;

        var result = [];
        result.push(loiterPoint.latitude);
        result.push(loiterPoint.longitude);
        result.push(landingLoiterAltitude);
        result.push(latitude);
        result.push(longitude);
        result.push(altitude);
        result.push(exitPoint.latitude);
        result.push(exitPoint.longitude);
        result.push(altitude);
        return result;
    },

    calculateVtolLanding(latitude, longitude, altitude, landingLoiterAltitude, isLoiterClockwise, landingDirection, vtolLandAGL) {
        var descendAltitude = landingLoiterAltitude - altitude;
        var loiterRadius = ConfigInfo.LoiterRadius;
        var descendAngle = GeoHelper.toRadians(ConfigInfo.VtolLandingDescendAngle);
        var initialSpeed = ConfigInfo.CruiseSpeed;
        var vtolMotorsCheckSeconds = 2.5;
        var descendDistance = (descendAltitude - vtolLandAGL) / descendAngle;
        if (descendDistance < 0) descendDistance = 0;
        var vtolMotorsCheckDistance = vtolMotorsCheckSeconds * initialSpeed;
        var vtolStopDistance = ConfigInfo.NavigationPointReachLimit;
        var distance = descendDistance + vtolMotorsCheckDistance + vtolStopDistance;
        var loiterExitPoint = GeoHelper.getDestination(latitude, longitude, landingDirection - 180, distance);
        loiterExitPoint.altitude = landingLoiterAltitude;
        var loiterPoint = GeoHelper.getDestination(loiterExitPoint.latitude, loiterExitPoint.longitude, landingDirection + (isLoiterClockwise ? 90 : -90), ConfigInfo.LoiterRadius);
        loiterPoint.altitude = loiterExitPoint.altitude;
        var descendPointDist = descendDistance + ConfigInfo.NavigationPointReachLimit;
        var descendPoint = GeoHelper.getDestination(loiterExitPoint.latitude, loiterExitPoint.longitude, landingDirection, descendPointDist);
        descendPoint.altitude = loiterExitPoint.altitude - descendPointDist * descendAngle;
        var list = [];
        list.push(loiterPoint);
        list.push(loiterExitPoint);
        list.push(descendPoint);
        list.push({latitude, longitude, altitude});
        return list;
    },

    calculateChuteLanding(latitude, longitude, altitude, landingLoiterAltitude, isLoiterClockwise, landingDirection, chuteLandAGL) {
        var descendAltitude = landingLoiterAltitude - altitude;
        var loiterRadius = ConfigInfo.LoiterRadius;
        var descendAngle = GeoHelper.toRadians(ConfigInfo.VtolLandingDescendAngle);
        var initialSpeed = ConfigInfo.CruiseSpeed;
        var descendDistance = (descendAltitude - chuteLandAGL) / descendAngle;
        if (descendDistance < 0) descendDistance = 0;
        var distance = descendDistance + ConfigInfo.ChuteTimeToWaitBeforeLaunch * initialSpeed;
        var loiterExitPoint = GeoHelper.getDestination(latitude, longitude, landingDirection - 180, distance);
        loiterExitPoint.altitude = landingLoiterAltitude;
        var loiterPoint = GeoHelper.getDestination(loiterExitPoint.latitude, loiterExitPoint.longitude, landingDirection + (isLoiterClockwise ? 90 : -90), ConfigInfo.LoiterRadius);
        loiterPoint.altitude = loiterExitPoint.altitude;
        var descendPointDist = descendDistance + ConfigInfo.NavigationPointReachLimit;
        var descendPoint = GeoHelper.getDestination(loiterExitPoint.latitude, loiterExitPoint.longitude, landingDirection, descendPointDist);
        descendPoint.altitude = loiterExitPoint.altitude - descendDistance * descendAngle;
        var list = [];
        list.push(loiterPoint);
        list.push(loiterExitPoint);
        list.push(descendPoint);
        list.push({latitude, longitude, altitude});
        return list;
    },

    async changeLandingRunway(index, halfRunwayLength) {
        try {
            var prevParam = this.mission.waypoints[index - 1].parameter;
            var cmd = this.mission.waypoints[index];
            var landingLoiterAltitude = this.mission.waypoints[index - 1].altitude;
            var result = this.calculateRunwayLanding(cmd.latitude, cmd.longitude, cmd.altitude, landingLoiterAltitude, prevParam.isLoiterClockwise, prevParam.loiterExitAngle, halfRunwayLength);
            this.changeWaypoint(index, result[3], result[4], result[5], {landingLongitudinalTolerance: halfRunwayLength});
            this.changeWaypoint(index + 1, result[6], result[7], result[8], 0);
        } catch (err) {
            console.log(err);
        }
    },

    changeLanding(index, latitude, longitude, altitude) {
        try {
            var param = this.mission.waypoints[index].parameter;
            var prevParam = this.mission.waypoints[index - 1].parameter;
            var landingLoiterAltitude = this.mission.waypoints[index - 1].altitude;
            var result = this.calculateRunwayLanding(latitude, longitude, altitude, landingLoiterAltitude, prevParam.isLoiterClockwise, prevParam.loiterExitAngle, param.landingLongitudinalTolerance);
            this.changeWaypoint(index - 1, result[0], result[1], result[2]);
            this.changeWaypoint(index, result[3], result[4], result[5]);
            this.changeWaypoint(index + 1, result[6], result[7], result[8]);
        } catch (err) {
            console.log(err);
        }
    },

    changeLandingBearing(index, bearing) {
        try {
            var cmd = this.mission.waypoints[index];
            var prevParam = this.mission.waypoints[index - 1].parameter;
            var landingLoiterAltitude = this.mission.waypoints[index - 1].altitude;
            var result = this.calculateRunwayLanding(cmd.latitude, cmd.longitude, cmd.altitude, landingLoiterAltitude, prevParam.isLoiterClockwise, bearing, cmd.param.landingLongitudinalTolerance);
            this.changeWaypoint(index - 1, result[0], result[1], result[2], {loiterExitAngle: bearing});
            this.changeWaypoint(index, result[3], result[4], result[5], cmd.param);
            this.changeWaypoint(index + 1, result[6], result[7], result[8], 0);
        } catch (err) {
            console.log(err);
        }
    },

    async changeLandingRunway(index, halfRunwayLength) {
        console.log("csharp.changeLandingRunway: Not implemented");
    },

    async changeLanding(index, latitude, longitude, altitude) {
        console.log("csharp.changeLanding: Not implemented");
    },

    async changeLandingBearing(index, bearing) {
        console.log("csharp.changeLandingBearing: Not implemented");
    },

    async changeApproachLandingPoint(index, latitude, longitude, altitude, loiterExitAngle) {
        this.changeWaypoint(index, latitude, longitude, altitude, {loiterExitAngle: loiterExitAngle});
    },

    async setTakeoff(latitude, longitude, altitude, yaw) {
        this.addWaypoint(0, "Takeoff-Runway", latitude, longitude, altitude, direction);
    },

    async setLaunch(latitude, longitude, altitude, yaw) {
        this.addWaypoint(0, "Takeoff-Launch", latitude, longitude, altitude, direction);
    },

    async setRunwayLanding(latitude, longitude, altitude, yaw) {
        if (yaw < 0) yaw += 360;
        this.addWaypoint(-1, "Land-Runway", latitude, longitude, altitude, yaw);
    },

    async setVtolTakeoff(latitude, longitude, altitude, direction) {
        if (direction < 0) direction += 360;
        this.addWaypoint(0, "Takeoff-Vtol", latitude, longitude, altitude, direction);
    },

    async setVtolLanding(latitude, longitude, altitude, direction) {
        if (direction < 0) direction += 360;
        this.addWaypoint(-1, "Land-Vtol", latitude, longitude, altitude, direction);
    },

    async setChuteLanding(latitude, longitude, altitude, direction) {
        if (direction < 0) direction += 360;
        this.addWaypoint(-1, "Land-Chute", latitude, longitude, altitude, direction);
    },

    async setCourse(altitude, bearing) {
        console.log("csharp.setCourse: Not implemented");
    },

    async setAirspeed(speed) {
        console.log(speed)
        let req = {
            aircraftId: this.selectedAircraft.aircraftId,
            aircraftName: this.selectedAircraft.aircraftName,
            aircraftCertificateName: this.selectedAircraft.aircraftCertificateName,
            command: "SetAirSpeed",
            speed: speed,
        }
        window.dispatchEvent(new CustomEvent('CommandRequest', {detail: req}));
    },

    async setAltitudeRelaxation(isRelaxed) {
        console.log("csharp.setAltitudeRelaxation: Not implemented");
    },

    getWayPointCount() {
        return this.mission.waypoints.length;
    },

    async applyCurrentCommand(data) {
        //console.log(data);
        let waypoint = new WayPoint(data.wayPointIndex, Command[data.command], data.waypointLatitude, data.waypointLongitude, data.waypointAltitude, data.param);
        let commandData = CommandExpanded.fromWaypoint(waypoint)
        this.setCurrentWaypoint(commandData.data, data.commandSource);
    },


    async clearSelection() {
        this.selectedWaypointIndices = [];
        window.dispatchEvent(new CustomEvent('WaypointSelectionChanged', {detail: this.selectedWaypointIndices}));
    },

    async selectWaypoint(index) {
        try {
            if (index < 0 || index >= this.mission.waypoints.length)
                throw "Invalid index";
            if (this.selectedWaypointIndices.indexOf(index) < 0) {
                this.selectedWaypointIndices.push(index);
                window.dispatchEvent(new CustomEvent('WaypointSelectionChanged', {detail: this.selectedWaypointIndices}));
            }
        } catch (err) {
            console.log(err);
        }
    },

    async deselectWaypoint(index) {
        try {
            if (index < 0 || index >= this.mission.waypoints.length)
                throw "Invalid index";
            let i = this.selectedWaypointIndices.indexOf(index);
            if (i >= 0) {
                this.selectedWaypointIndices.splice(i, 1);
                window.dispatchEvent(new CustomEvent('WaypointSelectionChanged', {detail: this.selectedWaypointIndices}));
            }
        } catch (err) {
            console.log(err);
        }
    },

    async deleteSelectedWaypoints() {
        this.selectedWaypointIndices.forEach((i) => this.deleteWaypoint(i));
        this.clearSelection();
    },

    async clearWaypoints(missionUpdateOrigin) {
        this.selectedWaypointIndices = [];
        this.mission.waypoints = [];
        window.dispatchEvent(new CustomEvent('WaypointsCleared', {detail: missionUpdateOrigin}));

    },

    getCommandIndex(command) {
        return this.mission.waypoints.findIndex((w) => w.command === command);
    },

    async addWaypoint(index, command, latitude, longitude, altitude, parameter) {
        console.log(altitude)
        let AddWaypoint = (index, command, latitude, longitude, altitude, parameter) => {
            try {
                let wp = new WayPoint(index, command, latitude, longitude, altitude, parameter);
                if (index < 0)
                    index = this.mission.waypoints.length;
                else if (index > this.mission.waypoints.length)
                    throw "Invalid index";
                this.mission.waypoints.splice(index, 0, wp);
                for (var i = index; i < this.mission.waypoints.length; i++)
                    this.mission.waypoints[i].index = i;
                window.dispatchEvent(new CustomEvent('WaypointAdded', {detail: wp}));
            } catch (err) {
                console.log(err);
            }
            //console.log(this.mission.waypoints)
        }

        if (index <= 0) {
            if (command.startsWith("Takeoff")) {
                index = 0;
                var i = this.getCommandIndex(Command.TakeOff);
                if (i == -1) i = this.getCommandIndex(Command.Launch);
                if (i != -1) this.deleteWaypoint(i);
            } else if (command.startsWith("Land")) {
                var i = this.getCommandIndex(Command.ApproachLanding);
                if (i != -1) this.deleteWaypoint(i);
            }
        }
        var homeAltitude = this.mission.home.altitude || 0;
        if (altitude == 0) altitude = homeAltitude;
        switch (command) {
            case "Waypoint":
                AddWaypoint(index, Command.WayPoint, latitude, longitude, altitude + ConfigInfo.AltitudeOverHome, {followTrack: true});
                break;
            case "Loiter":
                AddWaypoint(index, Command.LoiterUnlimited, latitude, longitude, altitude + ConfigInfo.AltitudeOverHome, {followTrack: true});
                break;
            case "Land-Runway": {
                var index1, index2, index3;
                if (index == -1) index1 = index2 = index3 = index;
                else {
                    index1 = index;
                    index2 = index + 1;
                    index3 = index + 2;
                }

                var landingLoiterAltitude = altitude + ConfigInfo.LandingLoiterAltitude;
                var result = this.calculateRunwayLanding(latitude, longitude, altitude, landingLoiterAltitude, false, parameter, 100);

                AddWaypoint(index1, Command.ApproachLanding, result[0], result[1], result[2], {
                    followTrack: true,
                    loiterExitAngle: parameter
                });
                AddWaypoint(index2, Command.Land, result[3], result[4], result[5], {landingLongitudinalTolerance: 100});
                AddWaypoint(index3, Command.TaxiStop, result[6], result[7], result[8]);
                /*if (index3 == -1) index3 = this.mission.waypoints.length - 1;
                window.dispatchEvent(new CustomEvent('WaypointChanged',{detail: this.mission.waypoints[index3]}));*/
            }
                break;
            case "Takeoff-Runway": {
                if (index == -1) index = 0;
                var dest = GeoHelper.getDestination(latitude, longitude, parameter, 100);
                AddWaypoint(index, Command.TaxiSpeedUp, dest.latitude, dest.longitude, altitude);
                AddWaypoint(index + 1, Command.TakeOff, dest.latitude, dest.longitude, altitude + ConfigInfo.LandingLoiterAltitude);
            }
                break;
            case "Takeoff-Launch": {
                if (index == -1) index = 0;
                AddWaypoint(index, Command.Launch, latitude, longitude, altitude + ConfigInfo.LandingLoiterAltitude);
            }
                break;
            case "Takeoff-Vtol": {
                if (index == -1) index = 0;
                var dest = GeoHelper.getDestination(latitude, longitude, parameter, 100);
                AddWaypoint(index, Command.VtolTakeOff, dest.latitude, dest.longitude, altitude + 20);
                AddWaypoint(index + 1, Command.VtolSpeedUp, dest.latitude, dest.longitude, altitude + 20 + ConfigInfo.VtolSpeedUpAltitudeAddOn);
                AddWaypoint(index + 2, Command.TakeOff, dest.latitude, dest.longitude, altitude + ConfigInfo.LandingLoiterAltitude);
            }
                break;
            case "Land-Vtol": {
                var vtolLandAGL = 20;
                var landingLoiterAltitude = altitude + ConfigInfo.LandingLoiterAltitude;
                var coors = this.calculateVtolLanding(latitude, longitude, altitude, landingLoiterAltitude, false, parameter, vtolLandAGL);
                AddWaypoint(index, Command.ApproachLanding, coors[0].latitude, coors[0].longitude, coors[0].altitude, {
                    followTrack: true,
                    loiterExitAngle: parameter
                });
                if (index >= 0) index++;
                AddWaypoint(index, Command.WayPoint, coors[2].latitude, coors[2].longitude, coors[2].altitude, {followTrack: true});
                if (index >= 0) index++;
                AddWaypoint(index, Command.ChuteLand, coors[3].latitude, coors[3].longitude, coors[3].altitude, vtolLandAGL);
            }
                break;
            case "Land-Chute": {
                var chuteLandAGL = ConfigInfo.ChuteDeploymentAltitude;
                var landingLoiterAltitude = altitude + ConfigInfo.LandingLoiterAltitude;
                var coors = this.calculateChuteLanding(latitude, longitude, altitude, landingLoiterAltitude, false, parameter, chuteLandAGL);
                AddWaypoint(index, Command.ApproachLanding, coors[0].latitude, coors[0].longitude, coors[0].altitude, {
                    followTrack: true,
                    loiterExitAngle: parameter
                });
                if (index >= 0) index++;
                AddWaypoint(index, Command.WayPoint, coors[2].latitude, coors[2].longitude, coors[2].altitude, {followTrack: true});
                if (index >= 0) index++;
                AddWaypoint(index, Command.ChuteLand, coors[3].latitude, coors[3].longitude, coors[3].altitude, chuteLandAGL);
            }
                break;
            case "Taxi":
                AddWaypoint(index, Command.TaxiToPoint, latitude, longitude, altitude);
                break;
            case "Hover":
                AddWaypoint(index, Command.VtolHoverTime, latitude, longitude, altitude + 20);
                break;
        }

    },

    async getWaypoint() {
        return this.mission.waypoints;
    },

    async setCurrentWaypoint(waypoint, commandSource) {
        window.dispatchEvent(new CustomEvent('CurrentWaypointChanged', {detail: {waypoint, commandSource}}));
    },

    async setWaypoint(index, command, latitude, longitude, altitude, parameter) {
        try {
            if (index < 0 || index >= this.mission.waypoints.length)
                throw "Invalid index";
            var wp = this.mission.waypoints[index];
            wp.command = command;
            wp.latitude = latitude;
            wp.longitude = longitude;
            wp.altitude = altitude;
            wp.parameter.assign(parameter);
            window.dispatchEvent(new CustomEvent('WaypointChanged', {detail: wp}));
        } catch (err) {
            console.log(err);
        }
    },
    async updateWaypoint(waypoint) {
        try {
            if (waypoint.index < 0 || waypoint.index >= this.mission.waypoints.length)
                throw "Invalid index";
            this.mission.waypoints[waypoint.index] = waypoint
            window.dispatchEvent(new CustomEvent('WaypointChanged', {detail: waypoint}));
        } catch (err) {
            console.log(err);
        }
    },

    async changeWaypoint(index, latitude, longitude, altitude, parameter) {
        try {
            var wp = this.mission.waypoints[index];
            wp.latitude = latitude;
            wp.longitude = longitude;
            wp.altitude = altitude;
            wp.parameter.assign(parameter);
            window.dispatchEvent(new CustomEvent('WaypointChanged', {detail: wp}));
        } catch (err) {
            console.log(err);
        }
    },

    async editWaypoint(index) {
        console.log("csharp.editWaypoint: Not implemented");
        window.dispatchEvent(new CustomEvent('editWaypoint', {detail: this.mission.waypoints[index]}));
    },

    async deleteWaypoint(index) {
        try {

            if (index < 0 || index >= this.mission.waypoints.length)
                throw "Invalid index";
            this.mission.waypoints.splice(index, 1);
            for (var i = index; i < this.mission.waypoints.length; i++)
                this.mission.waypoints[i].index = i;
            window.dispatchEvent(new CustomEvent('WaypointRemoved', {detail: index}));
        } catch (err) {
            console.log(err);
        }
    },

    async instantCommandIssue(command, latitude, longitude, altitude, isLoiterClockwise, followTrack) {
        console.log("csharp.instantCommandIssue: Not implemented");
    },

    async jumpToWaypoint(index) {
        let req = {
            aircraftId: this.selectedAircraft.aircraftId,
            aircraftName: this.selectedAircraft.aircraftName,
            aircraftCertificateName: this.selectedAircraft.aircraftCertificateName,
            command: "Jump",
            index: index
        }
        window.dispatchEvent(new CustomEvent('CommandRequest', {detail: req}));
    },

    async requestLook(latitude, longitude, mslAltitude) {
        console.log("csharp.requestLook: Not implemented");
    },


    setFailsafe(data) {
        this.mission.failsafe = data;
    },
    getFailsafe() {
        return this.mission.failsafe;
    },
    setMisssion(data) {
        this.mission = data;
    },

    getMission() {
        return this.mission;
    },

    getCurrentTelemetrySummary() {
        return this.telemetrySummaries[this.selectedAircraft.aircraftId];
    },
    clearGeoFence() {
        if (this.mission.geoFence == null) {
            return;
        }
        if (this.mission.geoFence.points) {
            for (let i = 0; i < this.mission.geoFence?.points.length; i++) {
                this.mission.geoFence.points.splice(i)
            }
            window.dispatchEvent(new CustomEvent('GeoFenceChanged', {detail: this.mission.geoFence}));
        }
    },
    geoFenceActive(isActivated) {
        let req = {
            aircraftId: this.selectedAircraft.aircraftId,
            aircraftName: this.selectedAircraft.aircraftName,
            aircraftCertificateName: this.selectedAircraft.aircraftCertificateName,
            command: "Mission_Geofence_Update",
            geoFenceMessage: {isActivated: isActivated}
        }
        window.dispatchEvent(new CustomEvent('CommandRequest', {detail: req}));
    },

    setAltitudeOverHome(number) {
        ConfigInfo.AltitudeOverHome = number;
    },
    getAltitudeOverHome() {
        return ConfigInfo.AltitudeOverHome;
    },

    manageAircrafts(){
        window.dispatchEvent(new CustomEvent('ManageAircrafts', {detail: null}));
    },
};

window.csharp = csharp;
