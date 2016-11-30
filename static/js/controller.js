var ISSChatApp = angular.module('GandalfChatApp', []);

ISSChatApp.controller('ChatController', function($scope){
    var socket = io.connect('https://' + document.domain + ':' 
    +location.port + '/gandalf'); 
    
    $scope.messages = [];
    
    $scope.loggedIn = false;
    $scope.username = '';
    $scope.password = '';
    $scope.text = '';
    
    socket.on('connect', function(){
        console.log("Connected!");
    });
    
    socket.on('message', function(msg){
        console.log(msg);
        $scope.messages.push(msg);
        $scope.$apply();
        var elem = document.getElementById('msgpane');
        elem.scrollTop = elem.scrollHeightArray;
    });
    
    socket.on('loggedIn', function(success){
        console.log(success)
        if(success == true) {
            console.log($scope.username + " logged in successfully!");
            $scope.loggedIn = true;
        }
        else {
            console.log($scope.username + " failed to log in.");
        }        
    });
    
    $scope.sendText = function sendText(){
        console.log('Sending text: ' + $scope.text);
        socket.emit('message', {'message': $scope.text, 'username': $scope.username});
        $scope.text = '';
    }
    
    $scope.logIn = function logIn(){
        console.log($scope.username + " logging in with password: " + $scope.password);
        socket.emit('logIn', {'username': $scope.username, 'password': $scope.password})
    }
    
    $scope.logOut = function logOut(){
        console.log($scope.username + " logged out.");
        $scope.loggedIn = false;
        $scope.username = '';
}});