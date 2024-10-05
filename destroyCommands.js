// Source and more info : https://discordjs.guide/slash-commands
// List of valid locales: https://discord.com/developers/docs/reference#locales
const { SlashCommandBuilder } = require( '@discordjs/builders' );
const chalk = require( 'chalk' );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v10' );
const config = require( './config.json' );
require( 'dotenv' ).config();
const TOKEN = process.env.token;
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_MODE = process.env.DEV_MODE.toLowerCase() === 'true';
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const commands = [].map( command => command.toJSON() );

( async () => {
    try {
        const rest = await new REST( { version: '10' } ).setToken( TOKEN );

        if ( !DEV_MODE ) {
            console.log( chalk.yellow( 'Attempting to clear global slash commands...' ) );
            await rest.put( Routes.applicationCommands( CLIENT_ID ), { body: commands } )
                .then( () => { console.log( chalk.green( 'Successfully cleared global slash commands.' ) ); } )
                .catch( errPutRest => { console.error( chalk.red( `Failed to clear global slash commands:\n${errPutRest.stack}` ) ); } );
        } else {
            console.log( chalk.yellow( 'Attempting to clear developer guild slash commands...' ) );
            await rest.put( Routes.applicationGuildCommands( CLIENT_ID, DEV_GUILD_ID ), { body: commands } )
                .then( () => { console.log( chalk.green( 'Successfully cleared developer guild slash commands.' ) ); } )
                .catch( errPutRest => { console.error( chalk.red( `Failed to clear developer guild slash commands:\n${errPutRest.stack}` ) ); } );
        }
    } catch ( noRest ) { console.error( chalk.red( `Failed to initiate rest:\n${noRest}` ) ); }
    console.log( 'YOU CAN NOW STOP THE INSTANCE AND UPDATE THE STARTUP COMMAND TO `node index.js`/' );
    setTimeout( () => { console.log( 'TIME IS UP!' ); }, 3600000 );
} )();
