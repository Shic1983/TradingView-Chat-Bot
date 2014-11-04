// Matching !seen
TVBot.prototype.seen = function( user ) { 
	that = this;
	var post  = { Username: user };
	var query = db.query('SELECT * from ChatLog WHERE ? ORDER BY Timestamp DESC LIMIT 1', post, function(err, result) {
		if (err) throw err;
		if(result.length > 0) {
	 		var msg = 'last seen '+result[0].Username+' '+timeago(new Date(result[0].Timestamp*1000))+', \''+result[0].Text+'\'';
	 		console.log(msg);
	 		that.sendMessage( msg );
	 	}
	});	
}
// Matching !popular
TVBot.prototype.busy = function( time ) { 
	that = this;
	var periods = {
		'24h': 86400,
		'12h': 43200,
		'1h': 3600, 
		'30m': 1800,
		'5m': 300
	}
	if(periods[time]) {
		var timestamp = unixTime(new Date()) - periods[time];
		var query = db.query('SELECT Username, Count(*) as TotalPosts FROM ChatLog WHERE Timestamp > ? AND Username != ? GROUP BY Username ORDER BY TotalPosts DESC LIMIT 3', [timestamp,that.username], function(err, rows) {
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