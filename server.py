#!/usr/bin/python

import os
import uuid
import psycopg2
import psycopg2.extras
from flask import Flask, session
from flask_socketio import SocketIO, emit

app = Flask(__name__, static_url_path='')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

users = {};

@app.route('/')
def mainIndex():
    print 'Sending static index.html'
    return app.send_static_file('index.html')

def connectToDB():

    connectString = 'dbname=gandalf user=sauron password=mordor host=localhost'
    
    try:
        print("Connected to the database!")
        return psycopg2.connect(connectString)
    except:
        print("Can't connect to the database!")

@socketio.on('connect', namespace='/gandalf')
def loadMessages():
    conn = connectToDB()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    #Load all of the messages
    query ="SELECT username, message FROM messages ORDER BY id;"
    
    cur.execute(query)
    
    messages = cur.fetchall()
    
    for message in messages:
        print(message)
        emit('message', message)
    
@socketio.on('message', namespace='/gandalf')
def on_message(data):
    print data
    newMessage = {'username': data['username'], 'message': data['message']} 
    print(newMessage)
    #Insert messages into DB
    emit('message', newMessage, broadcast=True)
    
@socketio.on('logIn', namespace='/gandalf')
def attempt_logIn(data):
    print(data['username'] + 
          " attempting to log in with password " +
          data['password'] +
          ".")
    
    if(data['password'] == "Shadowfax"):
        print("Success! " + data['username'] + " logged in.")
        emit('loggedIn', True)
    else:
        print("Password mismatch. " + data['username'] + " failed to log in.")
        emit('loggedIn', False)

# start the server
if __name__ == '__main__':
        socketio.run(app,
                     host=os.getenv('IP', '0.0.0.0'),
                     port =int(os.getenv('PORT', 8080)),
                     debug=True)