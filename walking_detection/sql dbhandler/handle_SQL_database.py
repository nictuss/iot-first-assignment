import pyodbc
import datetime

def connect_to_db():
    server = '<server-name>.database.windows.net'
    database = 'DB name'
    username = 'DBAdmin username'
    password = 'DB password'
    driver= '{ODBC Driver 17 for SQL Server}'
    cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';PORT=1433;DATABASE='+database+';UID='+username+';PWD='+ password)
    return cnxn

####################
#DELETION FUNCTITONS
####################
def delete_rows():
    conn = connect_to_db()
    cursor = conn.cursor()
    delete_string = "DELETE FROM Accelerometer.userdata"
    cursor.execute(delete_string)
    conn.commit()
    print("rows successfully deleted")
    conn.close()

def drop_table():
    conn = connect_to_db()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE nextroomDB.BigProject.userdata")
    conn.commit()
    print("table successfully dropped")
    conn.close()

####################
##CREATION FUNCTIONS
####################
def create_schema():
    conn = connect_to_db()
    cursor = conn.cursor()
    cursor.execute("CREATE SCHEMA BigProject")
    conn.commit()
    print("schema successfully created")
    conn.close()

def create_table():
    conn = connect_to_db()
    cursor = conn.cursor()
    cursor.execute("CREATE TABLE Accelerometer.edgeactivity (date datetime PRIMARY KEY, walking bit)")
    conn.commit()
    print("table successfully created")
    conn.close()


#CHANGE THE FUNCTIONS INNER SQL ACCORDING TO YOUR TABLES NAME
#Here is used Transact SQL, you can find more details about the syntax following this link:ù
#https://docs.microsoft.com/it-it/sql/t-sql/statements/statements?view=sql-server-ver15


#TO CREATE A TABLE:
#First create a schema:

#create_schema()

#Then create a table using that schema

#create_table()


#TO DELETE ROWS IN A TABLE:
#delete_rows()


#TO DELETE A TABLE:
#drop_table()