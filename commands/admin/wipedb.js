const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const botConfig = require( '../../models/GuildLogs.js' );

module.exports = {
    name: 'wipedb',
    description: 'Wipe my database.',
    ownerOnly: true,
    cooldown: 1000,
    run: async ( client, message, args ) => {
        const author = message.author;
        const botOwner = client.users.cache.get( process.env.OWNER_ID );
        const isBotOwner = ( author.id === botOwner.id ? true : false );
        if ( isBotOwner ) {
            message.delete();
            botConfig.deleteMany().then( entries => {
                const wasDeleted = ( entries.deletedCount === 1 ? 'an entry' : entries.deletedCount + ' entries' );
                const wasNoneOrDeleted = ( entries.deletedCount === 0 ? 'There were no entries to delete in' : 'I deleted ' + wasDeleted + ' from' );
                botOwner.send( wasNoneOrDeleted + ' the botConfig.DB.' ).catch( errSend => {
                    console.error( 'Error trying to notify you that I deleted the DB as you requested.\n%o', errSend );
                } );
            } ).catch( err=> { console.error( 'Error trying to delete botConfig.DB:\n%o', err ); } );
        }
    }
};
