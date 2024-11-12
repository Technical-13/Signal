require( 'dotenv' ).config();
const ENV = process.env;
const fs = require( 'fs' );
const chalk = require( 'chalk' );
const AsciiTable = require( 'ascii-table' );
const { PermissionsBitField } = require( 'discord.js' );
const { Routes } = require( 'discord-api-types/v10' );
const { REST } = require( '@discordjs/rest' );
const TOKEN = ENV.token;
const rest = new REST( { version: '10' } ).setToken( TOKEN );
const CLIENT_ID = ENV.CLIENT_ID;
const DEV_MODE = ENV.DEV_MODE.toLowerCase() === 'true';
const DEV_GUILD_ID = ENV.DEV_GUILD_ID;
const UPDATE_SLASH_COMMANDS = ENV.UPDATE_SLASH_COMMANDS.toLowerCase() === 'true';
const strScript = chalk.hex( '#FFA500' ).bold( './handlers/slashCommand.js' );

module.exports = ( client ) => {
  try {
    const table = new AsciiTable().setHeading( 'Group', 'Command', 'Load', 'Live' ).setBorder( '|', '=', "0", "0" )
    .setAlignRight( 0 ).setAlignLeft( 1 ).setAlignCenter( 2 ).setAlignCenter( 3 );
    const slashCommands = [];
    const devOnlyCmds = [];
    const buildTable = {};

    const cmdGroups = {};
    fs.readdirSync( './slashCommands/' ).forEach( async dir => {
      const files = fs.readdirSync( `./slashCommands/${dir}/` ).filter( file => file.endsWith( '.js' ) );
      if ( !files || files.length <= 0 ) { console.log( chalk.red( `SlashCommand directory, ${dir}, is empty!` ) );}
      else {
        const cmdGroup = [];
        for ( const file of files ) {
          let arrCmdRow = [ dir, file ];
          const cmdName = file.split( '.js' )[ 0 ];
          const slashCommand = require( `../slashCommands/${dir}/${file}` );
          if ( slashCommand.disable ) {
            arrCmdRow.push( '⭕' );
          }
          else if ( slashCommand.devOnly && slashCommand.name ) {
            devOnlyCmds.push( {
              name: slashCommand.name,
              name_localizations: slashCommand.name_localizations ? slashCommand.name_localizations : null,
              group: slashCommand.group || dir,
              description: slashCommand.description,
              description_localizations: slashCommand.description_localizations ? slashCommand.description_localizations : null,
              type: slashCommand.type,
              options: slashCommand.options ? slashCommand.options : null,
              default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
              default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve( slashCommand.default_member_permissions ).toString() : null
            } );
  //          cmdGroup.push( slashCommand.name );
            client.slashCommands.set( slashCommand.name, slashCommand );
            arrCmdRow[ 1 ] = cmdName;
            arrCmdRow.push( '➰' );
          }
          else if ( slashCommand.name ) {
            slashCommands.push( {
              name: slashCommand.name,
              name_localizations: slashCommand.name_localizations ? slashCommand.name_localizations : null,
              group: slashCommand.group || dir,
              description: slashCommand.description,
              description_localizations: slashCommand.description_localizations ? slashCommand.description_localizations : null,
              type: slashCommand.type,
              options: slashCommand.options ? slashCommand.options : null,
              default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
              default_member_permissions: slashCommand.default_member_permissions ? PermissionsBitField.resolve( slashCommand.default_member_permissions ).toString() : null
            } );
            cmdGroup.push( slashCommand.name );
            client.slashCommands.set( slashCommand.name, slashCommand );
            arrCmdRow[ 1 ] = cmdName;
            arrCmdRow.push( '✅' );
          }
          else { arrCmdRow.push( '⛔' ); }
          buildTable[ cmdName ] = arrCmdRow;
        }
        cmdGroup.sort();
        cmdGroups[ dir ] = cmdGroup;
      }
      client.groups.set( 'slashCmds', cmdGroups );
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
        } ).catch( errPutREST => {
          Object.keys( buildTable ).forEach( cmdKey => {
            buildTable[ cmdKey ].push( '❌' );
            table.addRow( buildTable[ cmdKey ] );
          } );
          statusPut += chalk.red( 'ERROR!' );
          console.error( 'ERROR:\n%o', errPutREST );
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
        } ).catch( errPutREST => {
          Object.keys( buildTable ).forEach( cmdKey => {
            buildTable[ cmdKey ].push( '❌' );
            table.addRow( buildTable[ cmdKey ] );
          } );
          statusPut += chalk.red( 'ERROR!' );
          console.error( 'ERROR:\n%o', errPutREST );
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
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};