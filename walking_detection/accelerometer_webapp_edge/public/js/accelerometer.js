//make connection to the backend
var socket = io();
console.log('connection made')


function processData(buffer)
{
  let movement = 0;
  let nb_messages = Object.keys(buffer).length;

  //initialize the last comuputed signal magnitude area 
  let prev_sma = Math.abs(buffer['event1']['accx']) + Math.abs(buffer['event1']['accy']) + Math.abs(buffer['event1']['accz']);

  for(let key in buffer){
      //Compute the current signal magnitude area
      let sma = Math.abs(buffer[key]['accx']) + Math.abs(buffer[key]['accy']) + Math.abs(buffer[key]['accz']);
      //count the number of messages in which the smartphone is moving
      if(Math.abs(sma - prev_sma) > 1){
          movement = movement + 1;
      }

      //update the last computed signal magnitude area
      prev_sma = sma;
  }

  //result of the computation
  let in_movement;

  //leave an error tolerance
  if(movement > (nb_messages/2)){
      in_movement = true;
  }
  else{
      in_movement = false;
  }

  return in_movement;
}


let status = document.getElementById('status');
if ( 'Accelerometer' in window ) {
  let sensor = new Accelerometer({frequency: 1});
  let counter = 0;
  let buffer = {};
  sensor.addEventListener('reading', function(e) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    status.innerHTML = 'x: ' + e.target.x + '<br> y: ' + e.target.y + '<br> z: ' + e.target.z;
    
    if(counter == 10){
      let message = {};
      let walking = processData(buffer);
      message['walking'] = walking;
      message['timestamp'] = dateTime;
      socket.emit('accelerometer', message);
      counter = 0;
      buffer = {};
    }
    else {
      accelerometer_data = {
        accx: e.target.x,
        accy: e.target.y, 
        accz: e.target.z,
        timestamp: dateTime
      };
      buffer['event' + (counter+1)] = accelerometer_data;
      counter += 1;
    }
  });
  sensor.start();
}
else status.innerHTML = 'Accelerometer not supported';