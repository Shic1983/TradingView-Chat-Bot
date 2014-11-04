// Run the bot
var username = '';
var password = '';
var friends = ['username1','username2'];

var bot = new TVBot();
bot.setOwners( friends );
bot.login( username, password );
