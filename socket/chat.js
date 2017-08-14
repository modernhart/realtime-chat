var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/',function(req,res){
	res.sendFile(__dirname+"/chatuser.html");
});

io.on('connection',function(socket){
	socket.on('login',function(data){
		console.log("client "+data.name+" has logined");
		io.emit("login",data.name);
		socket.name = data.name;
	});

	socket.on("chat",function(data){
		console.log("msg from client "+data.msg);

		var msg = {
			msg : data.msg,
			name : socket.name
		};
		io.emit('chat',msg);
	});

	socket.on('disconnect', function() {
    console.log('user disconnected: ' + socket.name);
		io.emit('disconnect',socket.name);
  });

});

server.listen(3000,function(){
	console.log("message io");
});
