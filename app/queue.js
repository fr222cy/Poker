module.exports = function(app, io){

    var queueHandler = require("./model/queueHandler.js");
    var qh = new queueHandler();
    var gameStarting = false;

    io.on('connection', function(socket){   
        
        socket.on('storeClientInfo', function (data) {
            if(!isUserAlreadyInQueue(data.customId)){
                var user = new Object();
                user.customId = data.customId;
                user.name = data.name;
                user.socketId = socket.id;
                qh.addUser(user);

                if(qh.getAmountOfUsers() >= qh.getMaxPlayers()){
                    qh.clear();
                    redirectToNewGame();
                }
            }
            notify();
        });

        socket.on('disconnect', function(){
            console.log("Socket to be removed: "+ socket.id);
            qh.removeUser(socket.id); 
            notify();
        });

        function redirectToNewGame(){
        
            var urlString = "/game/"+generateRandomID();
            io.emit("gameReady", {url: urlString} );
        }

        function notify(){
            userInQueueString = "Players in queue: ";
            qh.getAllUsersInQueue().forEach(function(element, index , arr){
                userInQueueString += "<br>" + element;
            });
           
            io.emit("queue",{ 
            inQueue: userInQueueString,
            totalInQueue: qh.getAmountOfUsers(),
            maxPlayers: qh.getMaxPlayers()
            });
        }
    });

    function isUserAlreadyInQueue(customId) {
        var result = false;
        var clients = qh.getClients();
        if(clients == null)
            return false;
        
        
        clients.forEach(function(element) {
            if(element.customId == customId)
                result = true;      
        });
    
        return result;
    }

    function generateRandomID()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 7; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

}

  