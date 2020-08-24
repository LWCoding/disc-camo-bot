require("./db/mongoose")
const User = require("./models/user")
const Discord = require("discord.js");
const fs = require('fs');
const moment = require('moment');
const Filter = require("bad-words")

const client = new Discord.Client();

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

client.on('guildMemberAdd', member => {
  let user = member.user
  member.roles.add("746461409533231225")
  let chnl = member.guild.channels.cache.find((channel) => channel.id == "745459951509700628")
  chnl.send(`**Welcome to the server <@!${user.id}>! I hope you like it here. uwu**`)
  user.send({
    "embed": {
      "title": "**Quick Server Verification**",
      "description": "Hi **" + user.username +"**! Welcome to the server! Send your answers to these questions in DMs, and a moderator will verify you shortly! \n**You only have one message, and you will not get another message until your form has been looked over.**",
      "color": 8169053,
      "thumbnail": {
        "url": "https://i.ibb.co/Ydd5f5n/image0.png"
      },
      "fields": [
        {
          "name": "Question #1",
          "value": "Are you 13 or older?"
        },
        {
          "name": "Question #2",
          "value": "How did you hear about this server?"
        }
      ]
    }
  })
});

client.on("guildMemberRemove", member => {
  let chnl = member.guild.channels.cache.find((channel) => channel.id == "745459959512432702")
  chnl.send(`**There goes <@!${member.user.id}>! I wonder if they'll come back. •~•**`)
})

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

const waitingList = []

client.on("message", async message => {
  if(message.author.bot) return;
    
  var sender = message.author;
  var senderUser = await User.findOne({discordId: sender.id})

  if (!message.guild) {
    var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase();

    const loneGuild = client.guilds.cache.get("745455051866112080")
    let senderMember = await loneGuild.members.fetch(sender.id)
    if (waitingList.includes(sender.id)) {
      return message.reply("You're already on the waiting list! Please wait until a moderator looks over your form.")
    }
    if (senderMember.roles.cache.some((role => role.id == "746461409533231225"))) {
      waitingList.push(sender.id)
      sender.send("**We have received your request! A moderator will look over your form shortly.**")
      loneGuild.channels.cache.get("746453797697486879").send({
        "embed": {
          "title": "**Server Verification Form**",
          "description": "**" + sender.username + "** has sent a verification request:\n\n> " + message.content.replace("\n", " ") + "\n\Type `" + config.prefix + "verify " + sender.username + "` or `" + config.prefix + "reject " + sender.username + "`.",
          "color": 8169053,
          "thumbnail": {
            "url": "https://i.ibb.co/Ydd5f5n/image0.png"
          }
        }
      })
      return
    }

    if (!senderUser) {
      return
    }

    var commandFound = false;
    for (let i = 0; i < senderUser.commands.length; i++) {
      let cmd = senderUser.commands[i]
      if (cmd.command == message.content.trim().replace(" -nocamo", "")) {
        let randomResponse = cmd.contents[Math.floor(Math.random()*cmd.contents.length)].item;
        commandFound = true;
        message.reply(randomResponse)
        break
      }
    }
    if (commandFound) return;

    if (message.content.slice(0, 5) != "camo ") return;

    var commandFound = false;
    for (let i = 0; i < senderUser.commands.length; i++) {
      let cmd = senderUser.commands[i]
      if (cmd.command == (command + " " + args.join(" ")).trim()) {
        let randomResponse = cmd.contents[Math.floor(Math.random()*cmd.contents.length)].item;
        commandFound = true;
        message.reply(randomResponse)
        break
      }
    }
    if (commandFound) return;

    message.reply(`I don't understand that command. >~< Maybe you can teach me?`).then((msg) => {
      msg.react('👍');
      msg.react('👎');
      msg.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'), {max: 1, time: 10000}).then((collected) => {
        if (collected.first() === undefined) throw new Error("No emoji provided!")
        if (collected.first().emoji.name == "👍") {
          message.reply("Reply with the message you want me to respond with when someone uses that command. •w•")
          message.author.dmChannel.awaitMessages(m => m.author.id == message.author.id, {max: 1, time: 60000}).then(collected => {
            let content = collected.first().content
            const filter = new Filter()
            if (content.length === 0 || filter.isProfane(content)) {
              return message.reply("sorry, i don't want to say that, or the message is too short! >~<")
            }
            let contents = []
            let camoResponse = ""
            content.split("|").forEach((response) => {
              camoResponse += `**${response.trim()}** or `
              contents.push({
                item: response
              })
            })
            let requiresCamo = !args.join(" ").includes(" -nocamo")
            senderUser.commands.push({
              command: `${command} ${args.join(" ")}`.trim().replace(" -nocamo", ""),
              requiresCamo,
              contents
            })
            senderUser.save()
            return message.reply("Alright! I'll say " + camoResponse.slice(0, camoResponse.length - 4) + " when you give me the command **" + (command + " " + args.join(" ")).trim().replace(" -nocamo", "") + "**.")
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
    return
  }

  // SPY ON SERVERS THE BOT IS IN:
  // client.users.cache.get('282319071263981568').send("[" + message.channel.name + "] " + message.author.username + " >> " + message.content);

  // if (sender == client.users.cache.get("668174570750083100") && message.channel.id != '674055833469976596') {
  //   message.delete();
  // }
  
  if (!senderUser) {
    const newUser = new User({discordId: sender.id})
    await newUser.save()
    senderUser = newUser
  }

  senderUser.messages++;
  await senderUser.save()

  var commandFound = false;
  senderUser.commands.forEach((cmd) => {
    if (!cmd.requiresCamo && (message.content == cmd.command)) {
      let randomResponse = cmd.contents[Math.floor(Math.random()*cmd.contents.length)].item;
      commandFound = true;
      return message.reply(randomResponse)
    }
  })
  if (commandFound) return;

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

  senderUser.commandsUsed++;
  await senderUser.save()

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
            },
            {
              "name": config.prefix + "stylize <text>",
              "value": "I'll stylize some text for channel names for you!"
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
            },
            {
              "name": config.prefix + "<text> [-nocamo]",
              "value": "I'll prompt you on what you want me to say after you tell me that. It's like a custom command! If you say -nocamo at the end, I'll reply even when you don't have 'camo' at the beginning."
            },
            {
              "name": config.prefix + "commands",
              "value": "See all of your preset commands that you've taught me! •w•"
            },
            {
              "name": config.prefix + "remove <command>",
              "value": "Remove one of your premade commands! See all of them using " + config.prefix + "commands!"
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

  if(command == "purge" || command == "clear") {
    if (message.member.hasPermission("ADMINISTRATOR")) {
      const deleteCount = parseInt(args[0], 10)+1;
      if(!deleteCount || deleteCount < 1 || deleteCount > 100) {
        return message.reply("you can only delete between 1-99 messages, " + pronoun + " >~<");
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
        "description": `**:money_with_wings: C-Bucks:** ${senderUser.coins}\n**:speech_left: Messages Sent:** ${senderUser.messages}\n**:loudspeaker: Commands Used:** ${senderUser.commandsUsed}`,
        "color": 9357965
      }}) 
    } else {
      user = message.mentions.users.first()
      try {
        const otherUser = await User.findOne({discordId: user.id})
        message.channel.send({"embed": {
          "title": user.username + ":",
          "description": `**:money_with_wings: C-Bucks:** ${otherUser.coins}\n**:speech_left: Messages Sent:** ${otherUser.messages}\n**:loudspeaker: Commands Used:** ${otherUser.commandsUsed}`,
          "color": 9357965
        }}) 
      } catch (error) {
        message.reply("i couldn't find info on that user... >~<")
      }
    }
    return
  }

  if (command == "verify") {
    const user = client.users.cache.find(user => user.username === args.join(" "));
    const loneGuild = client.guilds.cache.get("745455051866112080")
    const member = await loneGuild.members.fetch(user.id)
    message.reply("Successfully accepted " + user.username + "'s application.")
    member.roles.remove("746461409533231225")
    member.roles.add("745460785597251624")
    user.send("✅ **Your verification form has been approved! Please check the server for your new permissions.**")
    return
  }

  if (command == "reject") {
    const user = client.users.cache.find(user => user.username === args.join(" "));
    const loneGuild = client.guilds.cache.get("745455051866112080")
    const member = await loneGuild.members.fetch(user.id)
    message.reply("Successfully rejected " + user.username + "'s application.")
    member.roles.remove("746461409533231225")
    member.roles.add("745460785597251624")
    user.send("❌ **Your verification form was rejected. Please check and make sure you have answered all of the questions legitimately. Send another form when you are ready.**")
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

  if (command == "stylize") {
    if (!args) {
      return message.reply("What text do you want me to stylize?")
    }
    const fancyAlphabet = "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇"
    let phrase = ""
    let baseWord = args.join(" ")
    for (let i = 0; i < baseWord.length; i++) {
      if (baseWord[i] == " ") {
        phrase += "-"
        continue
      }
      if (!"abcdefghijklmnopqrstuvwxyz".includes(baseWord[i])) {
        phrase += baseWord[i]
        continue
      }
      phrase += fancyAlphabet.slice((baseWord[i].toLowerCase().charCodeAt(0) - 97) * 2, (baseWord[i].toLowerCase().charCodeAt(0) - 96) * 2)
    }
    return message.reply(phrase)
  }

  if (command == "remove") {
    let startingLength = senderUser.commands.length;
    for (let i = 0; i < senderUser.commands.length; i++) {
      if (senderUser.commands[i].command == args.join(" ").trim()) {
        senderUser.commands.splice(i, 1)
        break
      }
    }
    senderUser.save()
    if (startingLength != senderUser.commands.length) return message.reply("Successfully deleted command!");
    return message.reply("I couldn't find that command!");
  }

  if (command == "commands") {
    yourCommands = `Here is a list of your self-created commands. Delete one with "${config.prefix}" remove <command>:`
    senderUser.commands.forEach((command) => {
      let contents = ""
      command.contents.forEach((response) => {
        contents += `**${response.item}** or `
      })
      yourCommands += `\n**${command.command}** sends: ${contents.slice(0, contents.length - 4)}`
    })
    return message.reply(yourCommands)
  }

  senderUser.commandsUsed--;
  senderUser.save()

  var commandFound = false;
  for (let i = 0; i < senderUser.commands.length; i++) {
    let cmd = senderUser.commands[i]
    if (cmd.command == (command + " " + args.join(" ")).trim()) {
      let randomResponse = cmd.contents[Math.floor(Math.random()*cmd.contents.length)].item;
      commandFound = true;
      message.reply(randomResponse)
      break
    }
  }
  if (commandFound) return;

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
            let contents = []
            let camoResponse = ""
            content.split("|").forEach((response) => {
              camoResponse += `**${response.trim()}** or `
              contents.push({
                item: response
              })
            })
            let requiresCamo = !args.join(" ").includes(" -nocamo")
            senderUser.commands.push({
              command: `${command} ${args.join(" ")}`.trim().replace(" -nocamo", ""),
              requiresCamo,
              contents
            })
            senderUser.save()
            return message.reply("Alright! I'll say " + camoResponse.slice(0, camoResponse.length - 4) + " when you give me the command **" + (command + " " + args.join(" ")).trim().replace(" -nocamo", "") + "**.")
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