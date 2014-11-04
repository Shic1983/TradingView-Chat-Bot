
/*! TVBot - v0.1.0 - 2014-11-04
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

TVBot.prototype.setOwners = function( arr ) { 
	that = this;
	that.owners = arr;	
}
// Matching !seen
TVBot.prototype.seen = function( user ) { 
	that = this;
	var post  = { Username: db.escape(user) };
	var query = db.query('SELECT * from ChatLog WHERE ? ORDER BY Timestamp DESC LIMIT 1', post, function(err, result) {
		if (err) throw err;
		if(result.length > 0) {
	 		var msg = 'last seen '+result[0].Username+' '+timeago(new Date(result[0].Timestamp*1000))+', \''+result[0].Text+'\'';
	 		console.log(msg);
	 		that.sendMessage( msg );
	 	}
	});	
}
// Matching !popular <timeperiod>
TVBot.prototype.busy = function( time ) { 
	that = this;
    var periods = that.periods;
	if(periods[time]) {
		var timestamp = unixTime(new Date()) - periods[time];
		var query = db.query('SELECT Username, Count(*) as TotalPosts FROM ChatLog WHERE Timestamp > ? AND Username != ? GROUP BY Username ORDER BY TotalPosts DESC LIMIT 3', [timestamp,db.escape(that.username)], function(err, rows) {
			if(err) throw err;
			var msg = 'Busy chatters in the last '+time+'\n'; 
			var total = rows.length; 
			for (var i in rows) {
				msg += rows[i].Username+': '+rows[i].TotalPosts;
				if(i != total-1 ) msg += '\n';
			}
			that.sendMessage( msg );
		});		
	}
}
// MAtching !sentiment <timepeiord>
TVBot.prototype.sentiment = function( time ) {
	that = this;
    var periods = that.periods;
	if(periods[time]) {
		var timestamp = unixTime(new Date()) - periods[time];
		sums = { bulls: 1, bears: 1, total: 2 };
		
		var q = db.query("SELECT COUNT(*) as Total FROM (select COUNT(*) FROM ChatLog WHERE Timestamp > ? AND Text REGEXP '^(bull|buy|moon|uptrend|bull flag|pump|short squeeze)' GROUP BY Username) bulls", [timestamp], function(err, rows) {
			if(err) throw err;
			sums.bulls += rows[0].Total;
			
			var q = db.query("SELECT COUNT(*) as Total FROM (select COUNT(*) FROM ChatLog WHERE Timestamp > ? AND Text REGEXP '^(bear|sell|bear flag|double top|dumping|dump|long squeeze|downtrend)' GROUP BY Username) bulls", [timestamp], function(err, rows) {
				if(err) throw err;
				sums.bears += rows[0].Total;
				sums.total += (sums.bulls+sums.bears);
				msg = time+" sentiment index: Bulls: "+Math.round((sums.bulls/sums.total)*100)+"%, Bears: "+Math.round((sums.bears/sums.total)*100)+"%";
				
				that.sendMessage( msg );
			});		
		});	
		
	}
}
TVBot.prototype.login = function(username, password) { 
	that = this;
	that.username = username;

	login_curl = curl.create()
	login_curl(tvURL+'/accounts/signin/', {
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
		this.close();
	});
}
TVBot.prototype.sendMessage = function( text ) {
	that = this;
	sendmsg_curl = curl.create()
	sendmsg_curl(tvURL+'/conversation-post/', {
		POST: 1,
		POSTFIELDS: "text="+encodeURIComponent(text)+"&room=bitcoin&symbol=FROM:Botland&meta={}",
		COOKIE: "csrftoken="+that.csrftoken+";sessionid="+that.sessionid
	}, function(e) {
		console.log(e);
		console.log(this.body);
		this.close();
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
						if(letter == '!' && (that.owners.indexOf(d.username) > 0) ) { 
							  d.text.split(/\s+/).forEach(function(word) {
								word = word.toLowerCase().replace(/\W+/g, '');
								// if (~stopWords.indexOf(word) || !word) return;
								words.push(word);
							  });
							  switch(words[0]) {
									case 'seen':
										that.seen( words[1] );
										break;
									case 'stats':
										console.log('stats.');
										break;
									case 'busy':
										that.busy( words[1] );
										break;
									case 'sentiment':
										that.sentiment( words[1] );
										break;										
								}
						}
					}
				} catch(err) { 
					// Error 
				}
				// console.log("Received: '" + message.utf8Data + "'");
			}
		});
	});
	
	client.connect('ws://tradingview.com/message-pipe-ws/public/');

}
function TVBot () {
  var username, csrftoken, sessionid; 
  var owners = [];
  var periods = {};
  this.init();
} 
TVBot.prototype.init = function() { 
	this.periods = {
	'24h': 86400,
	'12h': 43200,
	'1h': 3600, 
	'30m': 1800,
	'5m': 300
    }	
}
