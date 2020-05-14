//make connection to the backend
var socket = io();
console.log('connection made')

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
          socket.emit('accelerometer', buffer);
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