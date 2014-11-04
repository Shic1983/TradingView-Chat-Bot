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