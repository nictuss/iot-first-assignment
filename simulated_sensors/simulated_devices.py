import random
import time
import threading
from azure.iot.device import IoTHubDeviceClient, Message

# Define the JSON message to send to IoT Hub.
MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity},"wind_direction": {direction},"wind_intensity": {intensity},"rain_height": {height}}}'

def iothub_client_init(device_name, connection_string):
    # Create an IoT Hub client
    client = IoTHubDeviceClient.create_from_connection_string(connection_string)
    return client

def iothub_client_telemetry_sample_run(device_name, connection_string):

    client = iothub_client_init(device_name, connection_string)
    print("device {} successfully connected".format(device_name))

    while True:
        # Build the message with simulated telemetry values.
        temperature = random.randint(-50, 50)
        humidity = random.randint(0, 100)
        wind_direction = random.randint(0, 360)
        wind_intensity = random.randint(0, 100)
        rain_height = random.randint(0, 50)
        msg_txt_formatted = MSG_TXT.format(temperature=temperature, humidity= humidity, direction = wind_direction, intensity = wind_intensity, height = rain_height)
        message = Message(msg_txt_formatted)

        # Send the message.
        print( "Device {} is sending message: {}".format(device_name, message) )
        client.send_message(message)
        print ( "Message successfully sent by {}".format(device_name))
        time.sleep(5)

#Define the number of devices that will simulate data
NB_DEVICES = 2
# Define the JSON message to send to IoT Hub.
MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity},"wind_direction": {direction},"wind_intensity": {intensity},"rain_height": {height}}}'

print ("Boot of 2 simulated meteo stations")
    
#define the connection strings for the two simulated devices
#in order to connect to the iot hub
connection_strings = [
    'HostName=iot-first-assignment.azure-devices.net;DeviceId=meteo_station_1;SharedAccessKey=sfikBz49v0DaQLMmHbG+wMVsXyP+ROW2Dg9O4GqHhJc=',
    'HostName=iot-first-assignment.azure-devices.net;DeviceId=meteo_station_2;SharedAccessKey=7gw05XQOUje4m9cLR6yYB4OuIDJ0OA1EY9tltK0tzGQ='
    ]

    
for i in range(NB_DEVICES):
    try:
        device_name = "meteo_station_" + str(i+1)
        thread = threading.Thread(target=iothub_client_telemetry_sample_run, args=(device_name, connection_strings[i],))  
        thread.start()
    except:
        print("thread {} stopped running".format(i+1))
