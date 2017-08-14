var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//접속자 랜덤 이름 부여
var randUser = function(){
	var name = "user";

	//1~100까지의 랜덤숫자
	var randn = parseInt((Math.random()*100)+1);
	var num = randn.toString();
	return name+num;
}

var users = new Array();

app.get('/',function(req,res){
	res.sendFile(__dirname+"/chatuser.html");
});

app.get('/home',function(req,res){
	res.sendFile(__dirname+"/lobby.html");
});

io.sockets.on('connection',function(socket){
	var exist = true;
	//해당 유저명이 존재한다면
	username = randUser();
	io.emit('join_notice',username);
	socket.name = username;

	console.log("client "+username+" has logined");
	users[socket.name] = username;
	var userlist = new Array();
	for(var i in users){
		userlist.push(users[i]);
	}
	io.sockets.emit("ulist",userlist);
	socket.emit('whoami',username);

	socket.on("chat",function(data){
		console.log("msg from client "+data.msg);
		var msg = {
			msg : data.msg,
			name : socket.name
		};
		io.emit('chat',msg);
	});

	socket.on('disconnect', function() {
		delete users[socket.name];
		var userlist = new Array();
		for(var i in users){
			userlist.push(users[i]);
		}
		io.sockets.emit('ulist',userlist);
    console.log('user disconnected: ' + socket.name);
		io.emit('disconnect',socket.name);
  });
});

server.listen(3000,function(){
	console.log("message io");
});
