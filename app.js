var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var path = require('path');

app.use(express.static('public'));

app.get('/',function(req,res){
	res.redirect('/talk');
});

app.get('/talk',function(req,res){
	res.sendFile(__dirname + "/chatting.html");
});


//접속자 랜덤 이름 부여
var randUser = function(){
	var name = "user";

	//1~100까지의 랜덤숫자
	var randn = parseInt((Math.random()*100)+1);
	var num = randn.toString();
	return name+num;
};

var users = [];

io.sockets.on('connection',function(socket){
	var exist = true;
	//해당 유저명이 존재한다면
	username = randUser();
	io.emit('join',username);
	socket.name = username;

	console.log("client "+username+" has logined");
	users[socket.name] = username;
	var userlist = [];
	for(var i in users){
		userlist.push(users[i]);
	}
	io.sockets.emit("ulist",userlist,username);
	socket.emit('whoami',username);

	socket.on("chat",function(data){
		console.log("msg from client "+data.msg);
		var msg = {
			msg : data.msg,
			name : socket.name
		};
		io.emit('chat',msg);
	});
	
	//entering text
	socket.on('entering', function(data) {
		socket.broadcast.emit('entering');
	});
	
	socket.on('stoping', function(data) {
		socket.broadcast.emit('stoping');
	});

	socket.on('disconnect', function() {
		delete users[socket.name];
		var userlist = [];
		for(var i in users){
			userlist.push(users[i]);
		}
		io.sockets.emit('ulist',userlist);
		io.emit('disconnect',socket.name);
  });
});

http.listen(port,function(){
	console.log("server is running");
});
