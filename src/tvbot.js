function TVBot () {
  var username, csrftoken, sessionid, debug; 
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
TVBot.prototype.setDebug = function( bool ) { 
	this.debug = bool;	
}