var events = require('events');
var request = require('request');
var curl = require('node-curl');
var fs = require('fs');
var mysql      = require('mysql');
var ee = new events.EventEmitter();
var WebSocketClient = require('websocket').client;
var unixTime = require('unix-time');
var timeago = require('timeago');
// unixTime(new Date()); // 1374016861

var db = mysql.createConnection({
  host: 'localhost',
  user: 'TVChatBot',
  password: 'TVChatBot',
  database: 'TVChatBot'
});
db.connect();
var tvURL = "https://www.tradingview.com";
