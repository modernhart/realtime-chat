(function () {
	var Message;
	var who = "";
	var socket = io();
	var mobileHeight = window.innerHeight;
	var mobileWidth = window.innerWidth;
	var title = $('.title');
	var modal = $('#myModal');
	var close = $(".close");
	var musicList = [
		'Classy Music and Fine Restaurant.mp3',
		'Happy Acoustic Background Music.mp3',
		'Instrumental.mp3',
		'Soul and Mind-Es Jammy Jams.mp3',
		'peppu.mp3'
	];
	var imageList = [
		'',
		'https://scontent-nrt.cdninstagram.com/vp/ecd8c995dcf47657920d358f82df8911/5CC5803E/t51.2885-15/e35/47585680_2294664957262462_6920519029156769376_n.jpg?_nc_ht=scontent-ort2-2.cdninstagram.com&se=7&ig_cache_key=MTk0OTk1NTc4NDMyNjY0Njc0MQ%3D%3D.2',
		'http://pognan.godohosting.com/product/curtain/blackout/shabbyrose/shabby_gray_list_545.jpg',
		'http://image.kyobobook.co.kr/newimages/giftshop_new/goods/400/1367/hot1547796069427.jpg'
	];
	var musicIndex = Math.floor(Math.random() * musicList.length);
	var music = new Audio('/music/' + musicList[musicIndex]);
	music.loop = true;

	if (window.navigator.userAgent.includes('Mobile')) {
		$('.chat_window')
			.height(mobileHeight)
			.width(mobileWidth);
		$('.messages').height(mobileHeight - 128);
	}
	$("#msgForm").focus();

	title.on('click', function() {
		modal.css('display', 'block');
	});

	close.on('click', function() {
		modal.css('display', 'none');
	});

	$(window).on('click', function(event) {
		if (event.target === modal[0]) {
			modal.css('display', 'none');
		}
	});

	//whoami
	socket.on("whoami",function(name){
		$("#msgForm").attr('placeholder',name);
		who = name;
	});
	
	//online user list
	socket.on('ulist', function(userlist, me) {
		$("#list").empty();
		$.each(userlist, function(index, value){
			$("#list").append("<li>" + value + "</li>");
		});
	});
	
	//music play
	$('.music').on('click', function(e) {
		var $this = $(this);
		if ($this.hasClass('play')) {
			music.pause();
			$this.removeClass('play');
		} else {
			music.play();
			$this.addClass('play');
		}
	});
	
	//image transition
	$('.scene').on('click', function(e) {
		var imageIndex = Math.floor(Math.random() * imageList.length);
		$('.messages').css('background-image', `url("${imageList[imageIndex]}")`);
	});

	Message = function (arg) {
		this.text = arg.text, this.message_side = arg.message_side;
		this.draw = function (_this) {
			return function () {
				var $message;
				var $notice;
				if (_this.message_side.includes('center')) {
					$message = $($('.message_template.notice').clone().html());
				} else {
					$message = $($('.message_template').clone().html());
				}
				$message.addClass(_this.message_side).find('.text').html(_this.text);
				$('.messages').append($message);
				return setTimeout(function () {
					return $message.addClass('appeared');
				}, 10);
			};
		}(this);
		return this;
	};
	$(function () {
		var getMessage, message_side, sendMessage, entering, initBtn;
		getMessage = function (text, notice) {
			var $messages, message;
			if (notice) {
				message_side = (notice === 'join') ? 'center join' : 'center exit';
			} else {
				message_side = 'left';
			}
			$messages = $('.messages');
			message = new Message({
				text: text,
				message_side: message_side
			});
			message.draw();
			return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
		};
		sendMessage = function (text, notice) {
			var $messages, message;
			if (text.trim() === '') {
				return;
			}
			$('.message_input').val('');
			message_side = 'right';
			$messages = $('.messages');
			message = new Message({
				text: text,
				message_side: message_side
			});
			socket.emit('chat',{msg : text});
			message.draw();
			return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
		};
		entering = function() {
			if (!$('.send_message').hasClass('entering')) {
				$('.send_message')
					.addClass('entering')
					.html('<div></div>');
				$('.send_message div')
					.addClass('lds-ellipsis').html('<div></div><div></div><div></div><div></div>');
			}
		};
		initBtn = function() {
			$('.send_message')
				.removeClass('entering')
				.html('<div class="text">Send</div>');
		};
		$('.send_message').click(function (e) {
			return sendMessage($('.message_input').val());
		});
		$('.message_input').keyup(function (e) {
			if (e.which === 13) {
				return sendMessage($('.message_input').val());
			}
			if (!e.target.value) {
				socket.emit('stoping', 'stoping');
			}
		});
		setInterval(function() {
			var input_value = $('.message_input').val();
			if (input_value) {
				socket.emit('entering', 'entering');
			}
		}, 500);
		socket.on('entering', function() {
			entering();
		});
		
		socket.on('stoping', function() {
			initBtn();
		});
		

		//notice
		socket.on('join',function(user){
			getMessage("join a " + user, 'join');
		});

		socket.on('disconnect',function(user){
			getMessage(user + " has left", 'exit');
		});

		socket.on('chat',function(data){
			if(data.name !== who){
				getMessage(data.msg);
			}
			initBtn();
		});
	});
}.call(this));