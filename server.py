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

def connectToDB():
    connectString = 'dbname=gandalf user=sauron password=mordor host=localhost'
    try:
        print("Connected to the database!")
        return psycopg2.connect(connectString)
    except:
        print("Can't connect to the database!")
        
def checkPassword(username, password):
    cur = connectToDB().cursor(cursor_factory=psycopg2.extras.DictCursor)
    query = cur.mogrify("SELECT username FROM users WHERE password = crypt(%s, password);", (password,))
    cur.execute(query);
    
    if cur.fetchone()[0] == username:
        return True
    else:
        return False

@app.route('/')
def serveSite():
    print 'Sending static index.html'
    return app.send_static_file('index.html')

@socketio.on('connect', namespace='/gandalf')
def loadMessages():
    cur = connectToDB().cursor(cursor_factory=psycopg2.extras.DictCursor)
    #Load all of the messages
    query ="SELECT username, message FROM messages ORDER BY id;"
    
    cur.execute(query)
    
    messages = cur.fetchall()
    
    for message in messages:
        #print(message)
        emit('messagePosted', {'username': message[0], 'message': message[1]})
    print "All messages loaded."
     
@socketio.on('login', namespace='/gandalf')
def attempt_logIn(data):
    print(data['username'] + 
          " attempting to log in with password " +
          data['password'] +
          ".")
    
    if checkPassword(data['username'], data['password']):
        session['username'] = data['username']
        emit('loginSucceeded')
        print("Success! " + session['username'] + " logged in.")
    else:
        emit('loginFailed')
        print("Password mismatch. " + data['username'] + " failed to log in.")
    
@socketio.on('postMessage', namespace='/gandalf')
def on_message(message):
    conn = connectToDB()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    newMessage = {'username': session['username'], 'message': message} 
    
    #Insert messages into DB
    query = cur.mogrify("INSERT INTO messages (username, message) VALUES (%s, %s);", (session['username'], message))
    try:
        cur.execute(query)
        conn.commit()
        print("Inserted a new message into the DB.")
        emit('messagePosted', newMessage, broadcast=True)
    except Exception as e:
        conn.rollback()
        print("INSERT failed.")
        print e
        
@socketio.on('search', namespace='/gandalf')
def search(data):
    conn = connectToDB()
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    
    print data
    
    query = "SELECT username, message FROM messages WHERE "
    if data['searchUsernames']:
        query += "username LIKE %s "
        
    if data['searchMessages']:
        if data['searchUsernames']:
            query += "OR "
        query += "message LIKE %s "
    query += ";"
    
    if data['searchUsernames'] and data['searchMessages']:
        query = cur.mogrify(query, ("%" + data['searchTerm'] + "%", "%" + data['searchTerm'] + "%"))
    else:
        query = cur.mogrify(query, ("%" + data['searchTerm'] + "%",))
     
    print query
    
    try:
        cur.execute(query)
        results = cur.fetchall()
        print results
        if len(results) != 0:
            for result in results:
                emit('resultFound', {'username': result[0], 'message': result[1]}) 
        else:
            emit('resultNotFound')
            
    except Exception as e:
        print("SELECT failed.")
        print e
        
# start the server
if __name__ == '__main__':
        socketio.run(app,
                     host=os.getenv('IP', '0.0.0.0'),
                     port =int(os.getenv('PORT', 8080)),
                     debug=True)