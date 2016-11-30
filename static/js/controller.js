var ISSChatApp = angular.module('GandalfChatApp', []);

ISSChatApp.controller('ChatController', function($scope){
    var socket = io.connect('https://' + document.domain + ':' 
    +location.port + '/gandalf'); 
    
    $scope.messages = [];
    
    $scope.loggedIn = false;
    $scope.username = '';
    $scope.password = '';
    $scope.message = '';
    
    socket.on('connect', function(){
        console.log("Connected!");
    });
    
    $scope.login = function login(){
        console.log($scope.username + " logging in with password: " + $scope.password);
        socket.emit('login', {'username': $scope.username, 'password': $scope.password});
    };
    
    socket.on('loginSucceeded', function(){
        console.log($scope.username + " logged in successfully!");
        $scope.loggedIn = true;
        $scope.$apply();
    });
    
    socket.on('loginFailed', function(){
        console.log($scope.username + " failed to log in.");
    });
    
    $scope.logout = function logout(){
        console.log($scope.username + " logged out.");
        $scope.loggedIn = false;
    };
    
    $scope.postMessage = function postMessage(){
        console.log('Posting : ' + $scope.message);
        socket.emit('postMessage', $scope.message);
        $scope.message = '';
    };
    
    socket.on('messagePosted', function(msg){
        console.log("Loaded a message from the server.")
        $scope.messages.push(msg);
        $scope.$apply();
        
        var elem = document.getElementById('msgpane');
        elem.scrollTop = elem.scrollHeightArray;
    });
});