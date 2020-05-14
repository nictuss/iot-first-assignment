const express = require('express');
const socket = require('socket.io');
var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client
var Message = require('azure-iot-device').Message;

const app = express();
const port = process.env.PORT || '3000';

app.use(express.static('public'));

//IoT hub Connection
var connectionString = "Your IoT hiub connection string";
var client = DeviceClient.fromConnectionString(connectionString, Mqtt);

var server = app.listen(port, () => {
console.log(`Listening to requests on http://localhost:${port}`);
});

var io = socket(server);

io.on('connection', function(socket){
    console.log('made socket connection');
    socket.on('accelerometer', function(data){
        console.log(data);
        var message = new Message(JSON.stringify({data}));
        console.log('Sending message: ' + message.getData());
        // Send the message to Azure IoT hub
        client.sendEvent(message, function (err) {
            if (err) {
                console.error('send error: ' + err.toString());
            } else {
                console.log('messages sent');
            }
        });
    })
});