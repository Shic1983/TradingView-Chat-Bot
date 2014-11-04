// Run the bot
var username = '';
var password = '';
var friends = ['zoinky','flibbr','Legion'];

var bot = new TVBot();
bot.setOwners( friends );
bot.login( username, password );
