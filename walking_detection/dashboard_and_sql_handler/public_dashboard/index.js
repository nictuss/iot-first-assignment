const express = require('express');
const socket = require('socket.io');
let bodyParser = require('body-parser');
let DBHandler = require('./scripts/dbhandler');
const EventHubReader = require('./scripts/event-hub-reader.js');

//To read messages from the Azure IoT Hub (Edge Computing Part)
const iotHubConnectionString = "Your IoT Hub connection string"
const eventHubConsumerGroup = "A consumer group from your IoT hub"

const app = express();
const port = process.env.PORT || '3000';

//static resources
app.use(express.static('public'));
//Configuring express to use body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let server = app.listen(port, () => {
console.log(`Listening to requests on http://localhost:${port}`);
});

let io = socket(server);

let db = new DBHandler();

//Initialize the IoT hub reader (Edge Computing Part)
const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

io.on('connection', function(socket){
    //Cloud Computing Part
    let count = 1;

    db.lastHourCloudValues(function(result){
        if(Object.keys(result).length != 0){
            emitDBCloudValues(result)
        }
    });

    ///////////////////////////////////////////////
    //CLIENT INTERFACE FUNCTIONS
    ///////////////////////////////////////////////

    //Send to the client the last Cloud values
    async function emitlastCloudValues(message){
        await socket.broadcast.emit('last cloud values', message);
    }

    //Send to the client the Cloud values taken from the db
    async function emitDBCloudValues(message){
        await socket.emit('database cloud values', message);
    }

    //Send to the client the Edge-detected last activity
    async function emitlastEdgeValues(message){
        await socket.emit('last edge activity', message);
    }

    //Send to the client the Edge values taken from the db
    async function emitDBEdgeValues(message){
        await socket.emit('database edge values', message);
    }

    //console.log('made socket connection');
    app.post('/',function(request,response){
        response.end('got the message');
        let message = request.body;
        emitlastCloudValues(message);

        if(count % 10 == 0){
            db.lastHourCloudValues(function(result){
                if(Object.keys(result).length != 0){
                    emitDBCloudValues(result)
                }
            });
            count = 0;
        }
        count +=1;
    });

    //Edge Computing Part
    let edgeCount = 1;

    db.lastHourEdgeValues(function(result){
        if(Object.keys(result).length != 0){
            emitDBEdgeValues(result)
        }
    });

    (async () => {
        await eventHubReader.startReadMessage((message, date) => {
          try {
            let payload = message.data;
            if(payload.walking != null){
                emitlastEdgeValues(payload)
                db.insertRow(payload.timestamp, payload.walking);

                if(edgeCount % 10 == 0){
                    console.log('ok');
                    db.lastHourEdgeValues(function(result){
                        if(Object.keys(result).length != 0){
                            emitDBEdgeValues(result)
                        }
                    });
                    edgeCount = 0;
                }
                edgeCount += 1;
            }
          } catch (err) {console.log(err)}
        });
      })().catch();
    
});