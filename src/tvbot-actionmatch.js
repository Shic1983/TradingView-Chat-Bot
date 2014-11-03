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