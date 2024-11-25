const client = require( '..' );
const chalk = require( 'chalk' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './events/messageUpdate.js' );
const botVerbosity = client.verbosity;

client.on( 'messageUpdate', async ( oldMessage, newMessage ) => {
  try {
    const { author, channel, content, guild, mentions } = newMessage;
    if ( author.bot ) return;
    if ( channel.type !== 0 ) return;
    const msgAuthor = await guild.members.cache.get( author.id );

    if ( newMessage.embeds.length >= 1 ) {
      const arrJunkEmbedTitles = [// Must be ( new RegExp() )
        ( new RegExp( 'Geocaching: Join the world\'s largest treasure hunt.' ) ),
        ( new RegExp( 'Get the free Official Geocaching app and join the world\'s largest t...' ) )
      ];// Must be ( new RegExp() )
      const arrJunkEmbedURLs = [ ( new RegExp( 'https?://(www\.)?ddowiki.com/(.*)', 'i' ) ) ];// Must be ( new RegExp() )
      var strLastFoundJunk = '';
      const hasJunkEmbed = ( newMessage.embeds.find( embed => {
        for ( const url of arrJunkEmbedURLs ) {
          if ( url.test( embed.url ) ) {
            strLastFoundJunk = embed.url;
            return embed;
          }
        }
        for ( const title of arrJunkEmbedTitles ) {
          if ( title.test( embed.title ) ) {
            strLastFoundJunk = embed.url;
            return embed;
          };
        }
      } ) ? true : false );

      if ( hasJunkEmbed ) {
        newMessage.suppressEmbeds( true );
        const baseMsg = '<@' + author.id + '>, I cleaned the embeds from your message.\n' +
          'To avoid this in the future, please wrap links like `<' + strLastFoundJunk + '>`\n';
        const msgCleaned = await newMessage.reply( baseMsg + 'This message will self destruct in 15 seconds.' );
        for ( let seconds = 14; seconds > 0; seconds-- ) {
          setTimeout( () => { msgCleaned.edit( baseMsg + 'This message will self destruct in ' + seconds + ' seconds.' ); }, ( 15 - seconds ) * 1000 );
        }
        setTimeout( async () => { await msgCleaned.edit( baseMsg ).then( () => { msgCleaned.delete(); } ); }, 15000 );
      }
    }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
} );