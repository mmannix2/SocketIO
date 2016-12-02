var ISSChatApp = angular.module('GandalfChatApp', []);

ISSChatApp.controller('ChatController', function($scope){
    var socket = io.connect('https://' + document.domain + ':' 
    +location.port + '/gandalf'); 
    
    $scope.messages = [];
    $scope.results = [];
    
    /*
     * Holds the state of the web page
     * 0 - loggedOut
     * 1 - chat
     * 2 - search
     */
    $scope.pageState = 0;
    
    $scope.searchUsernames = true;
    $scope.searchMessages = false;
    
    $scope.searchTerm = '';
    
    $scope.username = '';
    $scope.password = '';
    $scope.message = '';
    
    socket.on('connect', function(){
        console.log("Connected!");
    });
    
    $scope.login = function login(){
        console.log($scope.username +
                    " logging in with password: " +
                    $scope.password);
        socket.emit('login',
                    {'username': $scope.username,
                    'password': $scope.password });
    };
    
    socket.on('loginSucceeded', function(){
        console.log($scope.username + " logged in successfully!");
        $scope.pageState = 1;
        $scope.$apply();
    });
    
    socket.on('loginFailed', function(){
        console.log($scope.username + " failed to log in.");
    });
    
    $scope.logout = function logout(){
        console.log($scope.username + " logged out.");
        $scope.pageState = 0;
        //$scope.$apply();
    };
    
    $scope.postMessage = function postMessage(){
        console.log('Posting : ' + $scope.message);
        socket.emit('postMessage', $scope.message);
        $scope.message = '';
    };
    
    socket.on('messagePosted', function(msg){
        console.log("Loaded a message from the server.");
        $scope.messages.push(msg);
        $scope.$apply();
        
        var elem = document.getElementById('msgPane');
        elem.scrollTop = elem.scrollHeightArray;
    });
    
    $scope.search = function search(){
        console.log("Searching" +
                    ($scope.searchUsernames ?
                        ($scope.searchMessages ?
                            " Usernames and Messages " : " Usernames ") :
                        $scope.searchMessages ? " Messages " : " NONE " ) +
                    "for: " + $scope.searchTerm);
        while($scope.results.length > 0) {
            $scope.results.pop();
        }
        socket.emit('search',
                    {'searchTerm': $scope.searchTerm,
                    'searchUsernames': $scope.searchUsernames,
                    'searchMessages': $scope.searchMessages});
    };
    
    socket.on('resultFound', function(res){
        console.log("A search result has been recieved from the server.");
        $scope.results.push(res);
        $scope.$apply();
        
        var elem = document.getElementById('msgPane');
        elem.scrollTop = elem.scrollHeightArray;
    });
    
    socket.on('resultNotFound', function(){
        console.log("Search results have NOT been found on the server!");
    });
    
    $scope.goToChat = function goToChat(){
        console.log($scope.username + " switched to chat.");
        $scope.pageState = 1;
        //$scope.$apply();
    };
    
    $scope.goToSearch = function goToSearch(){
        console.log($scope.username + " switched to search.");
        $scope.pageState = 2;
        //$scope.$apply();
    };
    
});