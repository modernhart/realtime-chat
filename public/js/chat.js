(function () {
	var Message;
	var who = "";
	var socket = io();
	var mobileHeight = window.innerHeight;
	var mobileWidth = window.innerWidth;

	if (window.navigator.userAgent.includes('Mobile')) {
		$('.chat_window')
			.height(mobileHeight)
			.width(mobileWidth);
		$('.messages').height(mobileHeight - 128);
	}
	$("#msgForm").focus();

	//whoami
	socket.on("whoami",function(name){
		$("#msgForm").attr('placeholder',name);
		who = name;
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