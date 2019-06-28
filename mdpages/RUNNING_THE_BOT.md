# Starting the Bot
### Creating the Bot Application
1. Head over to the [Discord Developer Portal](https://discordapp.com/developers/applications/) and click "Create an application."
2. Configure the bot's name, profile picture, and description.
3. Go to `Bot` and click `Add Bot`. Then, click `Yes, do it!` to the prompt.
4. Configure your bot's username. Ignore the icon - that has already been configured.
5. At the section labeled `Token`, click `Copy`. Keep this token in a safe place and **DO NOT GIVE THIS TOKEN TO OTHER PEOPLE.**
6. Go to the configuration file (/src/Configuration/Configuration.Sample.ts). Look for the entry `export const Token = "";`. Put your token inside the quotes associated with the entry.

### Setting Up MongoDB (Windows)
1. Head over to MongoDB's [Download Site](https://www.mongodb.com/download-center). Go to the `Server` tab and install the latest version of MongoDB.
2. Once you installed MongoDB, create the following folder: `C:\data\db`. 
	- Go to your C drive (or wherever your OS files are stored) and make a file called `data`. Make a file inside `data` called `db`.
3. Open Command Prompt and use the command: `cd C:\Program Files\MongoDB\Server\3.2\bin`.
4. You want to now input the command `mongod`.
5. Command Prompt should now display information about your local server being hosted.
	- By default, Mongo starts your local server at port 27017. 
6. If all goes well, go to the configuration file again.
7. Look for `export const MongoDBConnectionURL: string = "";`. In the quotes, type `mongodb://localhost:27017`. 

### Running the Bot
1. If you are on:
	- Windows or Mac: Download & install [NodeJS](https://nodejs.org/). You should have version 8.0.0 (or later) of NodeJS installed.
	- Linux: Refer to NodeJS's installation guide [here](https://nodejs.org/en/download/package-manager/). You should have version 8.0.0 (or later) of NodeJS installed.
2. Set up a workspace folder (project folder). If you're using the bot template, rename the folder to something of your desire.
3. Head over to your Command Prompt (Windows) or Terminal (Linux) and type `npm install`. You may also have to type `npm install typescript` to install TypeScript.
4. In command prompt, under the root directory of the project, type `npm run start`. If all goes well, your bot should now be up.

# My Policy On Self-Hosting
I completely understand why people want to run their own instance of the bot. For me, it's because I want to be in control. Therefore, if you need it:
- I will assist in helping you set up the bot for local use.
- I will give you tips and feedback for bot hosting.

However, if you are going to host an instance of Turkie yourself, make sure that it is for private use only, in your own Discord server. Do **not** make your instance of Turkie a public bot, advertise Turkie as your own, and list it on any public website. We will take strict action if you violate this.