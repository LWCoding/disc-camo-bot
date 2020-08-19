const Discord = require("discord.js");
const fs = require('fs');
const moment = require('moment');

const client = new Discord.Client();
var userData = JSON.parse(fs.readFileSync('./userData.json', 'utf-8'));

const express = require('express');
const app = express();

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.listen(process.env.PORT);

const config = require("./package.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`); 
  client.user.setActivity(`Run commands with ${config.prefix} <command>.`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Run commands with ${config.prefix} <command>.`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Run commands with ${config.prefix} <command>.`);
});

client.on("message", async message => {
  if(message.author.bot) return;

  if (!message.guild) {
    if (message.author.id == "454550713557843978" || message.author.id == "282319071263981568") {
      try {
        client.channels.cache.get("745458649857785896").send(message.content)
        message.author.send("Successfully sent the message: **" + message.content + "** in the general chat.")
      } catch (error) {
        message.author.send("Something went wrong and your message wasn't sent. o~o")
      }
    }
    return
  }

  // SPY ON SERVERS THE BOT IS IN:
  // client.users.cache.get('282319071263981568').send("[" + message.channel.name + "] " + message.author.username + " >> " + message.content);
  
  var sender = message.author;
  var mentioneduser = message.mentions.users.first();
  var userCount = message.guild.members.cache.filter(member => !member.user.bot).size;
  
  // if (sender == client.users.cache.get("668174570750083100") && message.channel.id != '674055833469976596') {
  //   message.delete();
  // }
  
    if (!userData[sender.id]) {
      userData[sender.id] = {
        messages: 0
      }
  }
  userData[sender.id].messages++;
  console.log(userData[sender.id])

  fs.writeFile('userData.json', JSON.stringify(userData), (err) => {
    if (err) console.error(err);
  })

  if(message.content.indexOf(config.prefix) !== 0) return;
  
  var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  var command = args.shift().toLowerCase();

  if (command == "roast") {
      if (!args[0]) {
          return message.reply("who do you want me to roast? >~<")
      } else if (args[0].trim().toLowerCase() == "me") {
          args[0] = sender.username
      } 
      let roasts = ["erm... {user} is a meanie", "{user} i'm not gonna read you a bedtime story ò~ó", "i don't really want to roast {user} sir... o~o"]
      let roast = roasts[Math.floor(Math.random()*roasts.length)].replace("{user}", args[0])
      return message.channel.send(roast)
  }

  if (command == "report" || command == "info") {
      return message.reply(`you currently have ${userData[sender.id].messages} message(s) sent... i think. o~o`)
  }

});

  
client.login(process.env.TOKEN);