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
// Run the bot
var username = '';
var password = '';
var friends = ['username1','username2'];

var bot = new TVBot();
bot.setOwners( friends );
bot.login( username, password );
```

## Features
``!seen <username>``
Lets u know when a username was last seen, could also add in what their last sentiment reading was (bull/bear).

``!busy <timeperiod>``
Brings up some stats about who's been busy chatting in the chatbox for set period of time
  
## Ideas
``!sentiment <timeperiod>``
Could bring up overall sentiment 
  
``!subsribe walls|bigorders HUOBI:BTCCNY|BITSTAMP:BTCUSD``
Could subsribe users to pm's about big orders, wall movements on set exchanges  
   
``!poll <question> <duration>``
``!vote <yes|no>``
Obvious poll is obvious  
   
``!alert <username>``
Alert me (send me a pm) the next time a set user comes online
  
## Improvements
Allow commands to be send and received to the bot via PM not in main chat. 