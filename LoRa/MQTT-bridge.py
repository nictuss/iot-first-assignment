import time
import ttn
import base64
from azure.iot.device import IoTHubDeviceClient, Message

DEVICE_NAME = "mqtt-broker"
CONNECTION_STRING = "HostName=iot-assignments.azure-devices.net;DeviceId=mqtt-broker;SharedAccessKey=EaknHjDl+WFpzAnUXC7Hy69JbEHYPmZyh/H6kwOr85A="

app_id = "iot-app-test"
access_key = "ttn-account-v2.N8OWuLozmGzBiK2QCl60vu-FnVg9E7VypMm2S7sgWHQ"

#create a buffer to store messages
buf = []


def uplink_callback(msg, client):
  print("Received uplink from ", msg.dev_id)
  payload_raw = msg.payload_raw
  payload = base64.b64decode(payload_raw).decode()
  print(payload)
  buf.append(payload)
 




handler = ttn.HandlerClient(app_id, access_key)

# using mqtt client
mqtt_client = handler.data()
mqtt_client.set_uplink_callback(uplink_callback)
mqtt_client.connect()


#Set up the azure client
azure_client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
while(True):
  if buf:
    msg = buf.pop()
    message = Message(msg)
    azure_client.send_message(message)
    print ("Message successfully sent")
mqtt_client.close()


