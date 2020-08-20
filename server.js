const Discord = require("discord.js");
const fs = require('fs');
const moment = require('moment');
const Filter = require("bad-words")

const client = new Discord.Client();
var userData = JSON.parse(fs.readFileSync('./userData.json', 'utf-8'));
var commands = JSON.parse(fs.readFileSync('./commands.json', 'utf-8'));

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
  client.user.setActivity(`Run "${config.prefix} help".`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Run "${config.prefix} help".`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Run "${config.prefix} help".`);
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
  
  const checkFor = ["messages", "camoCoins", "commandsUsed"]
  if (!userData[sender.id] || !checkFor.every((attr) => userData[sender.id][attr] !== undefined)) {
    userData[sender.id] = {}
    checkFor.forEach((attr) => {
      if (userData[sender.id][attr] === undefined) {
        userData[sender.id][attr] = 0;
      }
    })
  }
  userData[sender.id].messages++;

  fs.writeFile('userData.json', JSON.stringify(userData), (err) => {
    if (err) console.error(err);
  })

  fs.writeFile('commands.json', JSON.stringify(commands), (err) => {
    if (err) console.error(err);
  })

  if(message.content.toLowerCase().indexOf(config.prefix) !== 0) return;
  
  var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  var command = args.shift().toLowerCase();
  var pronoun = sender.username;
  if (sender.id != "454550713557843978") { 
    if (message.member.roles.cache.some((role) => role.name === "He/Him")) {
      pronoun = "sir";
    } else if (message.member.roles.cache.some((role) => role.name === "She/Her")) {
      pronoun = "ma'am";
    }
  } else {
    pronoun = "commander";
  }

  userData[sender.id].commandsUsed++;

  if (command == "help") {
    message.delete()
    if (!args[0]) {
      return message.channel.send({
        "embed": {
          "title": "**Bot Help & Commands**",
          "description": "Of course " + pronoun + "! Use the command *" + config.prefix + "help <category>* to find out more information about a specific category!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LdP6GKc/image0.jpg"
          },
          "fields": [
            {
              "name": "General :wrench:",
              "value": "Random commands to play around with."
            },
            {
              "name": "Fun 🎲",
              "value": "Inventory and server economy commands."
            },
            {
              "name": "Admin :robot:",
              "value": "Advanced commands to help regulate the server."
            }
          ]
        }
      })
    }

    if (args[0].toLowerCase() == "fun" || args[0].toLowerCase() == "economy" || args[0].toLowerCase() == "eco") {
        return message.channel.send({
        "embed": {
          "title": "**Fun Commands 🎲**",
          "description": "Anything in <> is an argument you need to pass in, where [] is an optional argument!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LdP6GKc/image0.jpg"
          },
          "fields": [
            {
              "name": config.prefix + "say <words>",
              "value": "I'll say anything you want! Just don't make it too embarassing " + pronoun + "."
            },  
            {
              "name": config.prefix + "roast <name>",
              "value": "I'll roast a user, but I mean no harm. >~<"
            }
          ]
        }
      })
    }
    if (args[0].toLowerCase() == "general") {
      return message.channel.send({
        "embed": {
          "title": "**General Commands :wrench:**",
          "description": "Anything in <> is an argument you need to pass in, where [] is an optional argument!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LdP6GKc/image0.jpg"
          },
          "fields": [
            {
              "name": config.prefix + "profile [user]",
              "value": "I can tell you your information, or someone else's!"
            },
            {
              "name": config.prefix + "pfp <user>",
              "value": "I can get a user's profile picture if you want. •w•"
            }
          ]
        }
      })
    }
    if (args[0].toLowerCase() == "admin") {
      message.channel.send({
        "embed": {
          "title": "**Administrative Commands :robot:**",
          "description": "Anything in <> is an argument you  need to pass in, where [] is an optional argument!",
          "url": "https://discordapp.com",
          "color": 1025463,
          "thumbnail": {
            "url": "https://i.ibb.co/LdP6GKc/image0.jpg"
          },
          "fields": [
            {
              "name": config.prefix + "poll <title> <answer1> <answer2> [answer3] [answer4]",
              "value": "I can do a poll for you! Separate all spaces using underscores '_'."
            },
            {
              "name": config.prefix + "clear <number>",
              "value": "I'll clear some messages for you, but make sure it's in between 1-100. •^•"
            }
          ]
        }
      })
    } 
    return
  } 

  if (command == "say") {
    if (!args) {
      return message.reply(pronoun + "? what do you want me to say?")
    }
    const filter = new Filter()
    if (filter.isProfane(args.join(" "))) {
      return message.reply("i don't want to say that, " + pronoun + "! >~<")
    }
    message.delete()
    return message.channel.send(args.join(" "))
  }

  if(command == "purge" || command == "delete" || command == "clear") {
    if (message.member.hasPermission("ADMINISTRATOR")) {
      const deleteCount = parseInt(args[0], 10)+1;
      if(!deleteCount || deleteCount < 1 || deleteCount > 100) {
        return message.reply("you can only delete between 1-100 messages, " + pronoun + " >~<");
      }
      const fetched = await message.channel.messages.fetch({limit: deleteCount});
      try {
        message.channel.bulkDelete(fetched)
      } catch (error) {
        message.reply(`i couldn't do that because of ${error} o~o"`);
      }
    }
    return
  }

  if (command == "roast") {
      if (!args[0]) {
          return message.reply("who do you want me to roast? >~<")
      } else if (args[0].trim().toLowerCase() == "me") {
          args = [sender.username]
      } 
      args[0] = args.join(" ")
      let roasts = ["erm... {user} is a meanie", "{user} i'm not gonna read you a bedtime story ò~ó", "i don't really want to roast {user} sir... o~o"]
      let roast = roasts[Math.floor(Math.random()*roasts.length)].replace("{user}", `**${args[0]}**`)
      return message.channel.send(roast)
  }

  if (command == "report" || command == "info" || command == "profile" || command == "prof") {
    if (!message.mentions.users.first()) {
      message.channel.send({"embed": {
        "title": sender.username + ":",
        "description": `**:money_with_wings: C-Bucks:** ${userData[sender.id].camoCoins}\n**:speech_left: Messages Sent:** ${userData[sender.id].messages}\n**:loudspeaker: Commands Used:** ${userData[sender.id].commandsUsed}`,
        "color": 9357965
      }}) 
    } else {
      user = message.mentions.users.first()
      try {
        message.channel.send({"embed": {
          "title": user.username + ":",
          "description": `**:money_with_wings: C-Bucks:** ${userData[user.id].camoCoins}\n**:speech_left: Messages Sent:** ${userData[user.id].messages}\n**:loudspeaker: Commands Used:** ${userData[user.id].commandsUsed}`,
          "color": 9357965
        }}) 
      } catch (error) {
        message.reply("i couldn't find info on that user... >~<")
      }
    }
    return
  }

  if (command == "pfp") {
    if (!message.mentions.users.first()) {
      var user = client.users.cache.find(user => user.username === args.join(" "));
      message.channel.send({"embed": {
        image: {
          "url": user.avatarURL()
        }
      }})
    } else {
      var user = message.mentions.users.first();
      message.channel.send({"embed": {
        image: {
          "url": user.avatarURL()
        }
      }})
    }
    return
  }

  if (command == "poll") {
    let polloptions = []
    var eachopt = 0;
    var alphabet = 'abcdefghijklmnopqrstuvwxyz'
    for (eachopt in args.slice(1)) {
      polloptions.push(":regional_indicator_" + alphabet[polloptions.length] + ": " + args.slice(1)[eachopt].replace(/_/g, " "))
    }
    let conveyedmsg = args.join(" ");
    message.delete();
    message.channel.send({"embed": {
      "title": "**" + args[0].replace(/_/g, " ") + "**",
      "description": polloptions.join("\n\n") + "\n\n[You aren't required to pick an option, but feel free to! Every opinion matters!](https://discordapp.com/api/oauth2/authorize?client_id=600540277404336148&permissions=8&scope=bot)",
      "color": 7657439
    }}).then(async reactedmsg => {
      if (polloptions.length >= 1) {
        await reactedmsg.react("🇦");
      }
      if (polloptions.length >= 2) {
        await reactedmsg.react("🇧");
      }
      if (polloptions.length >= 3) {
        await reactedmsg.react("🇨");
      }
      if (polloptions.length >= 4) {
        await reactedmsg.react("🇩");
      }
      if (polloptions.length >= 5) {
        await reactedmsg.react("🇪");
      }
      if (polloptions.length >= 6) {
        await reactedmsg.react("🇫");
      }
      if (polloptions.length >= 7) {
        await reactedmsg.react("🇬");
      }
      if (polloptions.length >= 8) {
        await reactedmsg.react("🇭");
      }
    })
    return
  }

  if (command == "commands") {
    yourCommands = "Here is a list of your self-created commands:"
    Object.keys(commands).forEach((cmd) => {
      if (commands[cmd].senderId == sender.id) {
        yourCommands += `\n**${cmd}** sends: ${commands[cmd].content}`
      }
    })
    return message.reply(yourCommands)
  }

  var foundInCustom = false;
  Object.keys(commands).forEach((cmd) => {
    let userCommand = `${command} ${args.join(" ")}`
    if (userCommand.toLowerCase() == cmd.toLowerCase()) {
      if (commands[userCommand].senderId == sender.id) {
        message.channel.send(commands[userCommand].content)
      } else {
        message.channel.send(`You don't have permission to use that command ${pronoun}! Only your own. >~<`)
      }
      foundInCustom = true;
    }
  })
  if (foundInCustom) return;

  userData[sender.id].commandsUsed--;
  if (message.member.hasPermission("ADMINISTRATOR")) {
    message.reply(`I don't understand that command ${pronoun}. >~< Maybe you can teach me?`).then((msg) => {
      msg.react('👍');
      msg.react('👎');
      msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'), {max: 1, time: 10000}).then((collected) => {
        if (collected.first() === undefined) throw new Error("No emoji provided!")
        if (collected.first().emoji.name == "👍") {
          message.reply("Reply with the message you want me to respond with when someone uses that command. •w•")
          message.channel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 60000}).then(collected => {
            let content = collected.first().content
            const filter = new Filter()
            if (content.length === 0 || filter.isProfane(content)) {
              return message.reply("sorry, i don't want to say that, or the message is too short! >~<")
            }
            commands[`${command} ${args.join(" ")}`] = {content, senderId: sender.id}
            return message.reply("Alright! I'll say **" + content + "** when you give me the command **" + (command + " " + args.join(" ")).trim() + "**.")
          }).catch((error) => {
            return message.reply("You took too long. Maybe try again? >~<")
          })
        } else if (collected.first().emoji.name == "👎") {
          return message.reply("Aborted the function customization. •~•")
        }
      }).catch((error) => {
        return message.reply("Aborted the function customization. •~•")
      })
    })
  }

});

  
client.login(process.env.TOKEN);