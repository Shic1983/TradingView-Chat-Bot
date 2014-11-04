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