//make connection to the backend
var socket = io({transports: ['websocket']});


function delete_elements(html){
  let last_child = html.lastChild;
  while(last_child){
    html.removeChild(last_child);
    last_child = html.lastChild;
  }
}

function add_elements(html, msg){
  for(key in msg){
    let new_box = document.createElement('div');
    new_box.className = "messagebox";
    let new_message = document.createElement('p');
    new_message.textContent = 'timestamp: ' + msg[key]['timestamp'] + ' x: ' + msg[key]['accx'] + ' y: ' + msg[key]['accy'] + ' z: ' + msg[key]['accz'];
    let first_child = html.firstChild;
    new_box.appendChild(new_message);
    html.insertBefore(new_box, first_child);
  }
}

function add_elements_db(html, msg){
  for(key in msg){
    let new_box = document.createElement('div');
    new_box.className = "messagebox";
    let new_message = document.createElement('p');
    new_message.textContent = 'timestamp: ' + msg[key]['date'] + ' x: ' + msg[key]['x'] + ' y: ' + msg[key]['y'] + ' z: ' + msg[key]['z'] + ' walking: ' + msg[key]['walking'];
    let first_child = html.firstChild;
    new_box.appendChild(new_message);
    html.insertBefore(new_box, first_child);
  }
}

function add_elements_edge(html, msg){
  for(key in msg){
    let new_box = document.createElement('div');
    new_box.className = "messagebox";
    let new_message = document.createElement('p');
    new_message.textContent = 'timestamp: ' + msg[key]['date'] + ' walking: ' + msg[key]['walking'];
    let first_child = html.firstChild;
    new_box.appendChild(new_message);
    html.insertBefore(new_box, first_child);
  }
}

function updateStatus(walking, msg){
  if(msg == true){
    walking.textContent = 'WALKING';
    walking.className = 'walk';
  }
  else{
    walking.textContent = 'STANDING STILL'
    walking.className = 'stop';
  }
}

socket.on('last cloud values', function(msg){
  let cloud_last_sent_box = document.getElementById('clsb');
  let walking = document.getElementById('walkingCloud');
  console.log(msg['event1']);
  updateStatus(walking, msg['event1']['moving']);
  delete_elements(cloud_last_sent_box);
  add_elements(cloud_last_sent_box, msg);
});

socket.on('database cloud values', function(msg){
  let db_last_sent_box = document.getElementById('dblsb');
  add_elements_db(db_last_sent_box, msg);
});

////////////////////////////////////////
//EDGE COMPUTING PART
////////////////////////////////////////

socket.on('last edge activity', function(msg){
  let walking = document.getElementById('walkingEdge');
  updateStatus(walking, msg['walking']);
});

socket.on('database edge values', function(msg){
  let db_last_sent_box = document.getElementById('edgedb');
  add_elements_edge(db_last_sent_box, msg);
});