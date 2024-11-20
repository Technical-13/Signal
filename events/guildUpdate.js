const client = require( '..' );
const config = require( '../config.json' );
const chalk = require( 'chalk' );
const errHandler = require( '../functions/errorHandler.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const guildConfig = require( '../models/GuildConfig.js' );
const botVerbosity = client.verbosity;
const strScript = chalk.hex( '#FFA500' ).bold( './events/guildUpdate.js' );

client.on( 'guildUpdate', async ( oldGuild, newGuild ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const guildId = oldGuild.id;
    const guildOwner = newGuild.members.cache.get( newGuild.ownerId );
    const currGuildConfig = await getGuildConfig( oldGuild, true );
    const newName = ( newGuild.name != '' && newGuild.name != oldGuild.name ? true : false );
    const newOwner = ( newGuild.ownerId != '' && newGuild.ownerId != oldGuild.ownerId ? true : false );
    var doGuildUpdate = false;
    if ( newName ) {// Guild name changed
      if ( botVerbosity >= 2 ) { console.log( 'Changing G:%s to G:%s in my database...', chalk.bold.red( oldGuild.name ), chalk.bold.green( newGuild.name ) ); }
      currGuildConfig.Guild.Name = newGuild.name;
      doGuildUpdate = true;
    }
    if ( newOwner ) {// Guild owner id changed
      if ( botVerbosity >= 2 ) { console.log( 'G:%s changed ownership from U:%s to U:%s...', chalk.bold.green( newGuild.name ), chalk.bold.red( currGuildConfig.Guild.OwnerName ), chalk.bold.green( newGuild.members.cache.get( newGuild.ownerId ).displayName ) ); }
      currGuildConfig.Guild.OwnerID = newGuild.ownerId;
      currGuildConfig.Guild.OwnerName = newGuild.members.cache.get( newGuild.ownerId ).displayName;
      doGuildUpdate = true;
    }
    if ( doGuildUpdate ) {
      if ( botVerbosity >= 2 ) { console.log( '\tUpdating G:%s in my database...', chalk.bold.yellow( newGuild.name ) ); }
      currGuildConfig.Guild.Members = newGuild.members.cache.size;
      await guildConfig.updateOne( { _id: guildId }, currGuildConfig, { upsert: true } )
      .then( updateSuccess => { console.log( '\tSuccesfully updated G:%s in my database.', chalk.bold.yellow( newGuild.name ) ); } )
      .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( '\tError attempting to update G:%s in my database:\n%o' ), newGuild.name, updateError ); } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
} );