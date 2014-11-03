# TradingView Chat bot
  
To run... 

## DB
Setup mysql, you can import the mysql-dump.sql if you want to get started.
Defaults are; 
```
Host: localhost
Username: TVChatBot
Password: TVChatBot
Datbase: TVChatBot
```
^ This can be edited in ``src/app.js``

## Run the ChatBot
Edit the TVBot.js or TVBot.min.js and at the bottom put the code;  
```
var bot = new TVBot();
bot.login( 'username', 'password' );
```