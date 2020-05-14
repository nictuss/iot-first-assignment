import logging

import azure.functions as func
import json
import pyodbc
import datetime
import requests


def connect_to_db():
    server = 'accelerometerdata.database.windows.net'
    database = 'accelerometerdata'
    username = 'nictus'
    password = 'Ab525bfbmw'
    driver= '{ODBC Driver 17 for SQL Server}'
    cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';PORT=1433;DATABASE='+database+';UID='+username+';PWD='+ password)
    return cnxn

def insert_row(date, x, y, z, walking):
    conn = connect_to_db()
    cursor = conn.cursor()
    insert_string = "INSERT INTO Accelerometer.userdata (date, x, y, z, walking) VALUES (?, ?, ?, ?, ?);"
    cursor.execute(insert_string, date, x, y, z, walking)
    logging.info("row successfully added")
    conn.commit()
    conn.close()


def process_data(message_buf):
    movement = 0

    #initialize the last comuputed signal magnitude area 
    prev_sma = abs(message_buf['event1']['accx']) + abs(message_buf['event1']['accy']) + abs(message_buf['event1']['accz'])

    for k, m in message_buf.items():
        #Compute the current signal magnitude area
        sma = abs(message_buf[k]['accx']) + abs(message_buf[k]['accy']) + abs(message_buf[k]['accz'])
        #count the number of messages in which the smartphone is moving
        if abs(sma - prev_sma) > 1:
            movement = movement + 1

        #update the last computed signal magnitude area
        prev_sma = sma

    #leave an error tolerance
    if movement > (len(message_buf.items())/2):
        return True
    else:
        return False


def main(event: func.EventHubEvent):
    #had to delete square brackets
    message = event.get_body().decode()[1:-1]
    #logging.info('Python EventHub trigger processed an event: %s', message)

    #parse json string
    parsed_message = json.loads(message)['data']

    #do the processing to detect if the user is standing or is walking
    moving = process_data(parsed_message)

    #add info about the processing to the message, send it and save it into the db
    for k, m in parsed_message.items():
        #add info about the processing
        m['moving'] = moving

    #send http post to the public dashboard
    url = 'https://accelerometerdashboard.azurewebsites.net' #url of the public dashboard
    response = requests.post(url, json = parsed_message)

    for k, m in parsed_message.items():
        m['timestamp'] = datetime.datetime.strptime(m['timestamp'], '%Y-%m-%d %H:%M:%S')
        #save to the db
        insert_row(m['timestamp'], m['accx'], m['accy'], m['accz'], m['moving'])