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