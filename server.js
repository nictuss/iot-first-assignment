const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventHubReader = require('./scripts/event-hub-reader.js');
const DbHandler = require('./persistence-handler');

const iotHubConnectionString = "HostName=iot-first-assignment.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=4MiaKaAZCOs99vxaZKNjr3Kc9KqewnD/kAlfVPtm3q4="
const eventHubConsumerGroup = 'iotConsumerGroup'


console.log(iotHubConnectionString)

// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res /* , next */) => {
  res.redirect('/');
});

db = new DbHandler();

db.createDatabase()
  .then(() => db.readDatabase())
  .then(() => db.createContainer())
  .then(() => db.readContainer())
  .then(() => db.scaleContainer())
  .then(() => db.queryContainer())
  .then(() => {
    db.exit(`Completed successfully`)
  })
  .catch((error) => { exit(`Completed with error ${JSON.stringify(error) }`) });

//refresh the last hour table every 7 seconds
setInterval(queryDb, 7000);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        //console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

async function queryDb () {
  try{
    const results = await db.queryContainer();
    //console.log(JSON.stringify(results));
    wss.broadcast(JSON.stringify(results));
  }
  catch{
    console.error('Error broadcasting');
  }
}

server.listen(process.env.PORT || '3000', () => {
  console.log('Listening on %d.', server.address().port);
});

const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);


(async () => {
  await eventHubReader.startReadMessage((message, date, deviceId) => {
    try {
      var date = new Date();
      var hours = date.getUTCHours();
      var min = date.getUTCMinutes();
      //console.log(n);
      const payload = {
        Temperature: message.temperature,
        Humidity: message.humidity,
        Wind_direction: message.wind_direction,
        Wind_intensity: message.wind_intensity,
        Rain_height: message.rain_height,
        MessageDate: date || Date.now().toISOString(),
        Hours: hours,
        Minutes: min,
        DeviceId: deviceId,
      };

      db.createItem(payload);
      wss.broadcast(JSON.stringify(payload));

    } catch (err) {
      console.error('Error broadcasting: [%s] from [%s].', err, message);
    }
  });
})().catch();