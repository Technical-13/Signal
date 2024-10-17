const thisBotName = process.env.BOT_USERNAME;
const { model, Schema } = require( 'mongoose' );
const botConfigDB = require( '../../models/BotConfig.js' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );

module.exports = {
  name: 'wipedb',
  description: 'Wipe my database.',
  ownerOnly: true,
  cooldown: 1000,
  run: async ( client, message, args ) => {
    const botConfig = await botConfigDB.findOne( { BotName: thisBotName } )
      .catch( errFindBot => {  console.error( 'Unable to find botConfig:\n%o', errFindBot );  } );
    const { author, guild } = message;
    const botOwner = client.users.cache.get( botConfig.Owner );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    if ( isBotOwner ) {
      message.delete();
      guildConfigDB.deleteMany().then( entries => {
        const wasDeleted = ( entries.deletedCount === 1 ? 'an entry' : entries.deletedCount + ' entries' );
        const wasNoneOrDeleted = ( entries.deletedCount === 0 ? 'There were no entries to delete in' : 'I deleted ' + wasDeleted + ' from' );
        botOwner.send( wasNoneOrDeleted + ' the guildConfigDB.' ).catch( errSend => {
          console.error( 'Error trying to notify you that I deleted the DB as you requested.\n%o', errSend );
        } );
      } ).catch( err=> { console.error( 'Error trying to delete guildConfigDB:\n%o', err ); } );
    }
  }
};