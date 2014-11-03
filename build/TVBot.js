
/*! TVBot - v0.1.0 - 2014-11-03
* http://...github url.../
* Copyright (c) 2014 flibbr; Licensed MIT */

var events = require('events');
var request = require('request');
var curl = require('node-curl');
var fs = require('fs');
var mysql      = require('mysql');
var ee = new events.EventEmitter();
var WebSocketClient = require('websocket').client;
var unixTime = require('unix-time');
var timeago = require('timeago');
// unixTime(new Date()); // 1374016861

var db = mysql.createConnection({
  host: 'localhost',
  user: 'TVChatBot',
  password: 'TVChatBot',
  database: 'TVChatBot'
});
db.connect();
var tvURL = "https://www.tradingview.com";


// Matching !seen
TVBot.prototype.seen = function( user ) { 
	that = this;
	var post  = { Username: user };
	var query = db.query('SELECT * from ChatLog WHERE ? ORDER BY Timestamp DESC LIMIT 1', post, function(err, result) {
		console.log(result);
	 	if(result[0].Id) {
	 		var msg = 'last seen '+result[0].Username+' '+timeago(new Date(result[0].Timestamp*1000))+', \''+result[0].Text+'\'';
	 		console.log(msg);
	 		that.sendMessage( msg );
	 		that.sendMessage( "last seen zoinky 22 minutes ago, 'bitcoin's network is just too large, its counterproductive'" );
	 	}
	});	
}
TVBot.prototype.login = function(username, password) { 
	that = this;

	curl(tvURL+'/accounts/signin/', {
		POST: 1,
		POSTFIELDS: "username="+username+"&password="+password
	}, function(e) {
		
		var qparams = {}
		this.header.split(' ').forEach(function(el) {
				qparts = el.split('&');
				for(i in qparts){
		
					qpart = qparts[i].split('=');
					qparams[decodeURIComponent(qpart[0])] = 
								   decodeURIComponent(qpart[1] || '');
				}
		});
		that.csrftoken = qparams.csrftoken.substring(0, qparams.csrftoken.length - 1);
		that.sessionid = qparams.sessionid.substring(0, qparams.sessionid.length - 1);
		
		console.log('got connected.... ');	
		that.watchChat();
		
	});
}
TVBot.prototype.sendMessage = function( text ) {
	that = this;
	curl(tvURL+'/conversation-post/', {
		POST: 1,
		POSTFIELDS: "text="+encodeURIComponent(text)+"&room=bitcoin&symbol=FROM:Botland&meta={}",
		COOKIE: "csrftoken="+that.csrftoken+";sessionid="+that.sessionid
	}, function(e) {
		console.log(e);
		console.log(this.body);
	});	
}
TVBot.prototype.watchChat = function( ) {
	that = this;
	var client = new WebSocketClient();

	client.on('connectFailed', function(error) {
		console.log('Connect Error: ' + error.toString());
	});
	
	client.on('connect', function(connection) {
		console.log('WebSocket client connected');
		connection.on('error', function(error) {
			console.log("Connection Error: " + error.toString());
		});
		connection.on('close', function() {
			console.log('echo-protocol Connection Closed');
		});
		connection.on('message', function(message) {
			if (message.type === 'utf8') {
				msg = JSON.parse(message.utf8Data);
				try {
					if(msg.text.content.data.room == 'bitcoin') {
						var d = msg.text.content.data;
						var post  = { Username: d.username, Text: d.text, Room: d.room, PublishTime: d.time, Timestamp: unixTime(new Date()) };
						var query = db.query('INSERT INTO ChatLog SET ?', post, function(err, result) {
						  console.log('Inseted post by '+d.username+': '+d.text);
						});
						
						var letter = d.text.substring(0, 1);
						words = [];
						if(letter == '!' && (d.username == 'flibbr' || d.username == 'zoinky') ) { 
							  d.text.split(/\s+/).forEach(function(word) {
								word = word.toLowerCase().replace(/\W+/g, '');
								// if (~stopWords.indexOf(word) || !word) return;
								words.push(word);
							  });
							  console.log(words);
							  switch(words[0]) {
									case 'seen':
										that.seen( words[1] );
										break;
									case 'stats':
										console.log('stats.');
										break;
								}
						}
					}
				} catch(err) { 
					console.log(msg);	
				}
				// console.log("Received: '" + message.utf8Data + "'");
			}
		});
	});
	
	client.connect('ws://tradingview.com/message-pipe-ws/public/');

}
function TVBot () {
  var csrftoken, sessionid; 
} 
