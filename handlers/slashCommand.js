const fs = require( 'fs' );
const chalk = require( 'chalk' );
const AsciiTable = require( 'ascii-table' );
const { PermissionsBitField } = require( 'discord.js' );
const { Routes } = require( 'discord-api-types/v10' );
const { REST } = require( '@discordjs/rest' );
const TOKEN = process.env.token;
const rest = new REST( { version: '10' } ).setToken( TOKEN );
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_MODE = process.env.DEV_MODE.toLowerCase() === 'true';
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const UPDATE_SLASH_COMMANDS = process.env.UPDATE_SLASH_COMMANDS.toLowerCase() === 'true';

module.exports = ( client ) => {
    const table = new AsciiTable().setHeading( 'Group', 'Command', 'Load', 'Live' ).setBorder( '|', '=', "0", "0" )
    .setAlignRight( 0 ).setAlignLeft( 1 ).setAlignCenter( 2 ).setAlignCenter( 3 );
    const slashCommands = [];
    const devOnlyCmds = [];
    const buildTable = {};

    fs.readdirSync( './slashCommands/' ).forEach( async dir => {
        const files = fs.readdirSync( `./slashCommands/${dir}/` ).filter( file => file.endsWith( '.js' ) );

        for ( const file of files ) {
            let arrCmdRow = [ dir, file ];
            const cmdName = file.split( '.js' )[ 0 ];
            const slashCommand = require( `../slashCommands/${dir}/${file}` );
            if ( slashCommand.disable ) {
              arrCmdRow.push( '⭕' );
            } else if ( slashCommand.modCmd && slashCommand.name ) {
              devOnlyCmds.push( {
                  name: slashCommand.name,
                  name_localizations: slashCommand.name_localizations ? slashCommand.name_localizations : null,
                  description: slashCommand.description,
                  description_localizations: slashCommand.description_localizations ? slashCommand.description_localizations : null,
                  type: slashCommand.type,
                  options: slashCommand.options ? slashCommand.options : null,
                  default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
                  default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve( slashCommand.default_member_permissions ).toString() : null
              } );
              client.slashCommands.set( slashCommand.name, slashCommand );
              arrCmdRow[ 1 ] = cmdName;
              arrCmdRow.push( '➰' );
            } else if ( slashCommand.name ) {
              slashCommands.push( {
                  name: slashCommand.name,
                  name_localizations: slashCommand.name_localizations ? slashCommand.name_localizations : null,
                  description: slashCommand.description,
                  description_localizations: slashCommand.description_localizations ? slashCommand.description_localizations : null,
                  type: slashCommand.type,
                  options: slashCommand.options ? slashCommand.options : null,
                  default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
                  default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve( slashCommand.default_member_permissions ).toString() : null
              } );
              client.slashCommands.set( slashCommand.name, slashCommand );
              arrCmdRow[ 1 ] = cmdName;
              arrCmdRow.push( '✅' );
            } else { arrCmdRow.push( '⛔' ); }
            buildTable[ cmdName ] = arrCmdRow;
        }
    } );

    let statusPut = chalk.yellow( 'Slash Commands' ) + ':\n\t';
    const whoFor = ( DEV_MODE ? chalk.yellow( 'DEV_GUILD_ID: ' + DEV_GUILD_ID ) : chalk.green( 'EVERYONE!' ) );
    
    ( async () => {
        if ( UPDATE_SLASH_COMMANDS ) {
          if ( devOnlyCmds && !DEV_MODE ) {
            statusPut += 'Developer Only commands: ';
            await rest.put( Routes.applicationGuildCommands( CLIENT_ID, DEV_GUILD_ID ), { body: devOnlyCmds } ).then( ( submitted ) => {
                Object.keys( buildTable ).forEach( cmdKey => {
                  let cmdRegistered = submitted.find( cmd => cmd.name === cmdKey );
                  let cmdDevOnly = devOnlyCmds.find( cmd => cmd.name === cmdKey );
                  if ( cmdRegistered && cmdDevOnly ) { buildTable[ cmdKey ].push( '✅' ); }
                  else if ( cmdDevOnly ) { buildTable[ cmdKey ].push( '⛔' ); }
                  if ( cmdDevOnly ) { table.addRow( buildTable[ cmdKey ] ); }
                } );
                statusPut += chalk.green( 'Registered' );
            } ).catch( error => {
                Object.keys( buildTable ).forEach( cmdKey => {
                  buildTable[ cmdKey ].push( '❌' );
                  table.addRow( buildTable[ cmdKey ] );
                } );
                statusPut += chalk.red( 'ERROR!' );
                console.error( 'ERROR:\n%o', error );
            } );
          }
          statusPut += '\n\tLive Commands: ';
          const doRoute = ( DEV_MODE ? Routes.applicationGuildCommands( CLIENT_ID, DEV_GUILD_ID ) : Routes.applicationCommands( CLIENT_ID ) );
          await rest.put( doRoute, { body: slashCommands } ).then( ( submitted ) => {
              Object.keys( buildTable ).forEach( cmdKey => {
                  let cmdRegistered = submitted.find( cmd => cmd.name === cmdKey );
                  let cmdDevOnly = devOnlyCmds.find( cmd => cmd.name === cmdKey );
                  if ( cmdRegistered && !cmdDevOnly ) { buildTable[ cmdKey ].push( '✅' ); }
                  else if ( !cmdDevOnly ) { buildTable[ cmdKey ].push( '⛔' ); }
                  if ( !cmdDevOnly ) { table.addRow( buildTable[ cmdKey ] ); }
              } );
              statusPut += chalk.green( 'Registered' ) + ' for ' + whoFor;
          } ).catch( error => {
              Object.keys( buildTable ).forEach( cmdKey => {
                  buildTable[ cmdKey ].push( '❌' );
                  table.addRow( buildTable[ cmdKey ] );
              } );
              statusPut += chalk.red( 'ERROR!' );
              console.error( 'ERROR:\n%o', error );
          } );
        } else {
            statusPut += chalk.yellow( 'Unchanged!' ) + ' for ' + whoFor;
            Object.keys( buildTable ).forEach( cmdKey => {
                buildTable[ cmdKey ].push( '❎' );
                table.addRow( buildTable[ cmdKey ] );
            } );        
        }
        console.log( chalk.red( table.toString() ) );
        console.log( statusPut );
    } )();
};
