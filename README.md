**NOTICE:** For the time being, I have stopped the development of Turkie so I can focus on the development of another bot. I will continue to work on Turkie once I finish developing the other bot. Thank you for understanding! 

![Turkie Logo, Thanks to Cassie!](https://github.com/ewang20027/Turkie/blob/master/images/Turkie.png)

A complete rewrite of my JavaScript-based Discord bot, TurkieBot; Turkie, which is completely rewritten in TypeScript, is focused mainly on moderation. This bot was my submission to the Discord Hack Week contest.

The invite link for the public bot is [here](https://discordapp.com/api/oauth2/authorize?client_id=594006522816626690&permissions=8&scope=bot).

Want to know more about Turkie? Head over [here](https://github.com/ewang20027/Turkie/blob/master/mdpages/HISTORY.md).

Need support? Want to hang out? Turkie has a Discord server. Click [here](https://discord.gg/6eBTTDM) to join us.

# Purpose of Turkie
Turkie is a bot that primarily focuses on moderation. It uses [MongoDB](https://www.mongodb.com/) as its database. It was designed with the following ideas in mind.
- To be free for everyone to use (i.e. no paywall behind features).
- To be free of bloat (i.e. no useless commands that will slow the bot down).
- To be clear, complete, and concise (i.e. easy to use).

Turkie utilizes a three-strike system. For each automoderation offense, a user will receive one strike. The maximum amount of strikes can be changed. Along with the classic features such as kick, ban, clear, and more, Turkie also has the following features.

| Main Features | Description |
| --- | --- |
| AntiMention | If a user pings more roles or users than allowed, he or she will receive a strike. |
| AntiRaid | If multiple users join the server within a certain time, those users will receive a ban. |
| Invite Filter | If a user posts an invite link, even if the link is behind multiple URLs, he or she will receive a strike. |
| Server Lockdown | Server lockdown allows you to enable "lockdown" mode for either all invite links or specific invite links. If a user joins a server through a specific invite link that happens to also be under "lockdown," he or she will be automatically kicked. If a user joins a server when it is under full lockdown, he or she will be kicked. |
| Word Filter | If a user sends a word that happens to be on the list of "bad" words, he or she will receive a strike. |
| Join/Leave & Moderation Logging | Logs any members that join and leave the server, and any moderation action. |

# Using This Bot
It is strongly recommended that you use the public version of the bot. The invite link for the bot is [here](https://discordapp.com/api/oauth2/authorize?client_id=594006522816626690&permissions=8&scope=bot). Make sure the bot you are inviting is the real Turkie! 
- Tag: Turkie#6776
- User ID: 594006522816626690

However, if you're like me (where you want to be in control of everything), I completely understand. To run this bot, please head over [here](https://github.com/ewang20027/Turkie/blob/master/mdpages/RUNNING_THE_BOT.md).

# Turkie Team
The format is first & last name, Github tag, and their roles.
### Programmer
- Edward (@ewang20027) - Lead developer, owner of Turkie.

### Helpers
- Koubi (@slippard) - Teaching me the basics of MongoDB (which helped with a previous rework of TurkieBot).
- Dakota (@icicl) - Helper.
- Huy (@haku_c) - Helper.
- Trevor (@trevnerd) - Helper.
- Ian (@IanLulz) - Helper, hoster.

### Artist & Misc.
- Cassie - Profile picture artist.
- Marcella - Name of the bot.

# Contributions
If you would like to contribute to this bot, just submit a pull request! 
Have an issue? Please head over to the Issues tab. 

Thank you for taking the time to contribute. It means a lot. 