# Send telemetry data through LoRa using St-Lrwan1 devices and the things network

This is the folder for the third assignment of the iot class. The goal of this assignment was to built on-top of the cloud-based and edge-based components developed in the [first](https://github.com/nictuss/iot-assignments/tree/master/simulated_devices) and [second](https://github.com/nictuss/iot-assignments/tree/master/MQTT-SN:MQTT) assignments a system that retrieves telemery data from sensors. In this assignment, the MQTT protocol and the short-range wireless medium is replaced with LoRaWAN and TheThingsNetwork. I have developed a new RIOT-OS application that can be executed on the B-L072Z-LRWAN1 LoRa kit. I used TheThingsNetwork to interconnect the sensor devices with the cloud infrastructure (Azure IoT Hub) via the MQTT protocol. Below are provided the links to an hands on guide on how to build a system like this, and to a short youtube video that shows the functioning of the system I have developed.

Here you can find the hands on guide that will help you to develop a system like this: [Hands-on guide](https://www.linkedin.com/pulse/hands-on-tutorial-3-how-retrieve-telemetry-data-from-sensors-nicoló/?published=t)

Here you can find the video that shows the functioning of this system: [Youtube video](https://youtu.be/qMlvtD95DGE)
