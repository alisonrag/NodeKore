![Language](https://img.shields.io/badge/language-JavaScript-blue.svg)

![Stars](https://img.shields.io/github/stars/alisonrag/NodeKore)
![Fork](https://img.shields.io/github/forks/alisonrag/NodeKore?label=Fork)
![Watch](https://img.shields.io/github/watchers/alisonrag/NodeKore?label=Watch)

![Issues](https://img.shields.io/github/issues/alisonrag/NodeKore)
![Pull Requests](https://img.shields.io/github/issues-pr/alisonrag/NodeKore.svg)
![Contributors](https://img.shields.io/github/contributors/alisonrag/NodeKore.svg)

# NodeKore
 Openkore and Discord Integration using [BUS](https://openkore.com/wiki/Bus) and [Node.js](https://nodejs.org/en/)  

## Prerequisites
1 - [Openkore](https://github.com/OpenKore/openkore)  
2 - [Node.js](https://nodejs.org/en/)  
3 - [Discord Bot](https://discord.com/developers/applications)  
4 - A Discord Server where You and NodeKore are in the member list

## Quickstart
1 - Configure the file `conf/config.json`
 - "BOT_TOKEN" = Discord Bot Token
 - "BOT_CHANNEL" = Channel ID where bot will send the messages

2 - Copy the plugin: [NodeKore](https://github.com/alisonrag/NodeKore/blob/main/plugin/NodeKore.pl) to openkore plugins folder  
3 - Add the plugin to load list in `openkore/control/sys.txt`  
4 - set `bus 1` and `bus_server_port 1234`in `openkore/control/sys.txt` (bus_server_port [sys.txt] must be equal to SOCKET_PORT[config.json])  
5 - Open terminal and go to NodeKore root folder  
6 - Type: `npm install`
7 - Type: `node index.js`  
8 - Go to the default Discord Server Channel and type `!channel` to define the channel as default

## F.A.Q. (Frequently Asked Questions)
 1. **Where can i get the Channel ID?**
    - use command `!channel` in discord server channel

 2. **What is BUS?**
    - [BUS](https://openkore.com/wiki/Bus) is a Openkore system/protocol used to communication between instances

## Avaliable Commands
`!info`: Show information about all connected bots.    
`!quit`: <all/username/accountID> : Send Quit command to specific bot, if not defined send to all.  
`!relog`: <all/username/accountID> \<time> : Send relog command to specific bot, if not defined send to all.  
`!pm`: <from/all> \<to> \<message> : Send PM command to bot.  
`!channel`: Show the current Channel ID  
`!h`: Show the Avaliable Commands
 
 ## Screenshots
 ![NodeKore](https://i.imgur.com/sjGY013.png)
 ![NodeKore](https://i.imgur.com/WhLMakO.png)
