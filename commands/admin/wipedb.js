const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'wipedb',
  description: 'Wipe my guilds database.',
  ownerOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    const { author, guild } = message;
    const { botOwner, isBotOwner, isDevGuild } = await userPerms( client, author, guild );
    if ( isBotOwner && isDevGuild ) {
      message.delete();
      guildConfigDB.deleteMany().then( entries => {
        const wasDeleted = ( entries.deletedCount === 1 ? 'an entry' : entries.deletedCount + ' entries' );
        const wasNoneOrDeleted = ( entries.deletedCount === 0 ? 'There were no entries to delete in' : 'I deleted ' + wasDeleted + ' from' );
        botOwner.send( wasNoneOrDeleted + ' the guildConfigDB.' ).catch( errSend => {
          console.error( 'Error trying to notify you that I deleted the DB as you requested.\n%o', errSend );
        } );
      } ).catch( err=> { console.error( 'Error trying to delete guildConfigDB:\n%o', err ); } );
    }
    else if ( isBotOwner ) {
      botOwner.send( { content: 'You can only wipe my database from the development guild.' } )
        .catch( errSend => {
          console.error( 'Failed to DM you that you can only wipe my database from the development guild: %o', errSend );
        } );
    }
  }
};