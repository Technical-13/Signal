const client = require( '..' );
const chalk = require( 'chalk' );
const errHandler = require( '../functions/errorHandler.js' );
const getGuildConfig = require( '../functions/getGuildDB.js' );
const guildConfig = require( '../models/GuildConfig.js' );

client.on( 'guildUpdate', async ( oldGuild, newGuild ) => {
  try {
    const botOwner = client.users.cache.get( client.ownerId );
    const guildId = oldGuild.id;
    const guildOwner = newGuild.members.cache.get( newGuild.ownerId );
    const currGuildConfig = await getGuildConfig( oldGuild );
    const newName = ( newGuild.name !== oldGuild.name ? true : false );
    const newOwner = ( newGuild.ownerId !== oldGuild.ownerId ? true : false );
    var doGuildUpdate = false;
    if ( newName ) {// Guild name changed
      currGuildConfig.Guild.Name = newGuild.name;
      doGuildUpdate = true;
    }
    if ( newOwner ) {// Guild owner id changed
      currGuildConfig.Guild.OwnerID = newGuild.ownerId;
      currGuildConfig.Guild.OwnerName = newGuild.displayName;
      doGuildUpdate = true;
    }
    if ( doGuildUpdate ) {
      currGuildConfig.Guild.Members = newGuild.members.cache.size;
      await guildConfig.updateOne( { _id: guildId }, currGuildConfig, { upsert: true } )
      .then( updateSuccess => { console.log( 'Succesfully updated %s (id: %s) in my database.', chalk.bold.yellow( newGuild.name ), guildId ); } )
      .catch( updateError => { throw new Error( chalk.bold.cyan.inverse( 'Error attempting to update %s (id: %s) to my database:\n%o' ), newGuild.name, guildId, updateError ); } );
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', chalk.hex( '#FFA500' ).bold( './events/guildUpdate.js' ), errObject.stack ); }
} );