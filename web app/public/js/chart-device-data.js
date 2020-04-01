$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);


  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.device_num = deviceId[deviceId.length-1];
      this.maxLen = 60;
      // To store the result of the query on the database
      this.telemetryTable = new Array(this.maxLen);
    }

    //Displays last sent values from this device
    displayLastSentValues(lastValues, nb) {
      const lastSentBody = document.querySelector("#last-sent-data-" + nb + " > tbody");
      //Clears out the old last sent values
      $("#last-sent-data-" + nb + " tbody tr").remove();

      //table header
      const header = ["Event time", "Temperature (Celsius)", "Humidity (%)", "Wind direction (degrees)", "Wind intensity (m/s)", "Rain height (mm/h)"];
      var i;
      const hr = document.createElement("tr");
      for (i = 0; i < header.length; i++) {
        const th = document.createElement("th");
        th.textContent = header[i];
        hr.appendChild(th);
      }
      lastSentBody.appendChild(hr);

      const tr2 = document.createElement("tr");
      lastValues.forEach((cell) => {
        const td2 = document.createElement("td");
        td2.textContent = cell;
        tr2.appendChild(td2);
      });
      lastSentBody.appendChild(tr2);
    }

    //Clears out existing table data
    clearOutData(nb,telBody){
      $("#telemetry-table-" + nb + " tbody tr").remove();

      //table header
      const header = ["Event time", "Temperature (Celsius)", "Humidity (%)", "Wind direction (degrees)", "Wind intensity (m/s)", "Rain height (mm/h)"];
      var i;
      const hr = document.createElement("tr");
      for (i = 0; i < header.length; i++) {
        const th = document.createElement("th");
        th.textContent = header[i];
        hr.appendChild(th);
      }
      telBody.appendChild(hr, telBody);

    }

    //Populates the table of the last hour telemetry values
    async populateTelemetry(table) {
      const telemetryBody1 = document.querySelector("#telemetry-table-1 > tbody");
      const telemetryBody2 = document.querySelector("#telemetry-table-2 > tbody");

      await this.clearOutData(1,telemetryBody1);
      await this.clearOutData(2,telemetryBody2);

      //Populate last hour tables
      table.forEach((row) => {
        const tableRow = [row.MessageDate, row.Temperature, row.Humidity, row.Wind_direction, row.Wind_intensity, row.Rain_height];
        const tr = document.createElement("tr");

          tableRow.forEach((cell) => {
            const td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
          });
          if(row.DeviceId == "meteo_station_1"){
            telemetryBody1.appendChild(tr);
          }
          else{
            telemetryBody2.appendChild(tr);
          }
      });
    }
  }

  class TrackedDevices {
    constructor(){
      this.devices = [new DeviceData("meteo_station_1"), new DeviceData("meteo_station_2")];
    }

    findDevice(deviceId){
      if(deviceId == "meteo_station_1"){
        return this.devices[0];
      }
      else{
        return this.devices[1];
      }
    }
  }

  const trackedDevices = new TrackedDevices();

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update a table containing telemetry data for that device
  webSocket.onmessage = function onMessage(message) {
    const messageData = JSON.parse(message.data);
    // find or add device to list of tracked devices
    const device = trackedDevices.findDevice(messageData.DeviceId);
    if(!messageData[1]) {
      try {
        //console.log(messageData);

        // time is required

        if (!messageData.MessageDate) {
          return;
        }

        device.displayLastSentValues([messageData.MessageDate, messageData.Temperature, messageData.Humidity, messageData.Wind_direction, messageData.Wind_intensity, messageData.Rain_height], device.device_num);
      } catch (err) {
        console.error(err);
      }
    }
    else{
      device.populateTelemetry(messageData);
    }
  };
});