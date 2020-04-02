# How to send telemetry data from sensors using RIOT os

This folder contains code that could be used to build a system that retrieves telemetry data from sensors and sends it though an architecture like: RIOT device -> MQTT-SN/MQTT bridge -> 
MQTT broker -> Azure IoT Hub -> Web App. This aims to extend the work done in the first 
homework with the possibility to develop some code that can actually run on real devices, that 
do not need anymore to be simulated by a python script

Here there is the link to a guide that can help building a system like this:

https://www.linkedin.com/pulse/how-retrieve-telemetry-data-send-web-app-through-mqtt-nicoló-palmiero/?published=t

and here there is a short video demonstration of the functioning of the system:

https://youtu.be/K2o-JvymCBA
