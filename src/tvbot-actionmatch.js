// Matching !seen
TVBot.prototype.seen = function( user ) { 
	that = this;
	var query = db.query('SELECT * from ChatLog WHERE Username='+db.escape(user)+' ORDER BY Timestamp DESC LIMIT 1', [], function(err, result) {
		if (err) throw err;
		if(result.length > 0) {
	 		var msg = 'last seen '+result[0].Username+' '+timeago(new Date(result[0].Timestamp*1000))+', \''+result[0].Text+'\'';
	 		that.sendMessage( msg );
	 		if(that.debug==1) console.log('DEBUG, SendingMsg: '+msg);
	 	}
	});	
	 if(that.debug==1) console.log('DEBUG, Query: '+query.sql);
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
	 		if(that.debug==1) console.log('DEBUG, SendingMsg: '+msg);
		});	
	 	if(that.debug==1) console.log('DEBUG, Query: '+query.sql);	
	}
}
// MAtching !sentiment <timepeiord>
TVBot.prototype.sentiment = function( time ) {
	that = this;
    var periods = that.periods;
	if(periods[time]) {
		var timestamp = unixTime(new Date()) - periods[time];
		sums = { bulls: 1, bears: 1, total: 2 };
		
		var q = db.query("SELECT COUNT(*) as Total FROM (select COUNT(*) FROM ChatLog WHERE Timestamp > ? AND Text REGEXP '^(up|bull|buy|moon|uptrend|bull flag|pump|short squeeze)' GROUP BY Username) bulls", [timestamp], function(err, rows) {
			if(err) throw err;
			sums.bulls = sums.bulls+rows[0].Total;
			
			var q = db.query("SELECT COUNT(*) as Total FROM (select COUNT(*) FROM ChatLog WHERE Timestamp > ? AND Text REGEXP '^(down|bear|sell|bear flag|double top|dumping|dump|long squeeze|downtrend)' GROUP BY Username) bulls", [timestamp], function(err, rows) {
				if(err) throw err;
				sums.bears = sums.bears+rows[0].Total;
				sums.total = (sums.bulls+sums.bears);
				msg = time+" sentiment index: Bulls: "+Math.round((sums.bulls/sums.total)*100)+"%, Bears: "+Math.round((sums.bears/sums.total)*100)+"%";
				
				that.sendMessage( msg );
				if(that.debug==1) console.log('DEBUG, SendingMsg: '+msg);
			});		
		});	
	}
}
// MAtching !slap <user>
TVBot.prototype.slap = function( slapper, victim ) {
	that = this;
	msg = slapper+" slaps "+victim+" around a bit with a large trout";
	that.sendMessage( msg );
	if(that.debug==1) console.log('DEBUG, SendingMsg: '+msg);
}
// Matching !quote <user>
TVBot.prototype.quote = function( user ) { 
	that = this;
	var query = db.query("SELECT Username, Text from ChatLog WHERE CHAR_LENGTH(Text) >= 3 AND CHAR_LENGTH(Text) <= 200 AND Username="+db.escape(user)+" LIMIT 1", [], function(err, rows) {
		if(err) throw err;
		if(rows.length > 0) {
			var msg = rows[0]['Username']+': "'+rows[0]['Text']; 
			that.sendMessage( msg );
	 		if(that.debug==1) console.log('DEBUG, SendingMsg: '+msg);
		}
	});	
	if(that.debug==1) console.log('DEBUG, Query: '+query.sql);
}