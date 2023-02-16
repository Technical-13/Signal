/*
This is a template for use with Discord.js v14, you can use this to make a Discord bot.
You can use this as a start point for your bot, no credit required, all the steps have comments.
The template will have event handlers to move events into seperate files, cooldowns on commands, and
slash commands. These are enough to start building your bot empire.
I have been using Discord.js since 2017, so I am looking to help people out with their projects, 
since I own a verified bot on Discord that supports nearly 50,000 members.
*/

const Discord = require( "discord.js" ); // Import Discord.js for use in the project
const fs = require( "fs" ); // Import FS to read event files

// Specify intents needed by the bot, in this case, just get guild events
const client = new Discord.Client( { intents: [ Discord.Intents.FLAGS.GUILDS ] } );

// Create an object-like data structure to store all our commands
client.commands = new Discord.Collection();
// Also create one for user cooldowns
client.cooldowns = new Discord.Collection();

// Get all files ending with .js in the commands folder
const commandFiles = fs.readdirSync( './commands' ).filter( file => file.endsWith( '.js' ) );
// Get all files ending with .js in the events folder
const eventFiles = fs.readdirSync( './events' ).filter( file => file.endsWith( '.js' ) );

for ( const file of commandFiles ) { // For each file in the commands folder that we fetched earlier do:
	const command = require( `./commands/${file}` ); // Import the file to the current instance
	client.commands.set( command.name, command ); // Set it to the commands collection
}

for ( const file of eventFiles ) { // For each file in the events folder do:
	const event = require( `./events/${file}` ); // Import the file
	if ( event.once ) { // event.once means should it be run once, which we will cover more of later.
    // Define the event to run when called, but only once
		client.once( event.name, ( ...args ) => event.run( ...args, client ) );
	} else {
    // Define the event to run every time it is called. Pass all arguments to the event code.
		client.on( event.name, ( ...args ) => event.run( ...args, client ) );
	}
}

// To start setting up commands, next read interactionCreate.js in the events folder

client.login( process.env.TOKEN ) // Your bot token must be secured, read these steps to set one up:


/*
1. To create your bot account, go to https://discord.com/developers/applications
2. Click new application and give it a name
3. On the left panel, click "Bot"
4. Make the application into a bot user
5. Copy the token
6. On the left side of this repl, click the padlock
7. In the key, type "token" without the quotes. In the value, paste the token
8. Hit "Add new secret"

Your bot can now be customised on the developer portal. You must not share your bot token or anyone will be able to access it with full permissions.
*/