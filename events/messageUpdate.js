const client = require( '..' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const OWNER_ID = process.env.OWNER_ID;

client.on( 'messageUpdate', async ( oldMessage, newMessage ) => {
  const { author, channel, content, guild, mentions } = newMessage;
  if ( author.bot ) return;
  if ( channel.type !== 0 ) return;
  const isDevGuild = ( guild.id == DEV_GUILD_ID );
  const botOwner = client.users.cache.get( OWNER_ID );
  const isBotOwner = ( author.id === botOwner.id ? true : false );
// Get botMods, isBotMod
  const objGuildMembers = guild.members.cache;
  const objGuildOwner = objGuildMembers.get( guild.ownerId );
  const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
  const msgAuthor = await guild.members.cache.get( author.id );
  
  const arrJunkEmbedTitles = [
    'Geocaching: Join the world\'s largest treasure hunt.',
    'Get the free Official Geocaching app and join the world\'s largest t...'
  ];
  const arrJunkEmbedURLs = [];
  const hasJunkEmbed = ( newMessage.embeds.find( embed => {
    for ( const title of arrJunkEmbedTitles ) {
      if ( embed.title === title ) {
        arrJunkEmbedURLs.push( embed.url );
        return embed;
      };
    }
  } ) ? true : false );
  
  if ( hasJunkEmbed ) {
    newMessage.suppressEmbeds( true );
    const baseMsg = '<@' + author.id + '>, I cleaned the embeds from your message.\n' +
      'To avoid this in the future, please wrap links like `<' + arrJunkEmbedURLs[ 0 ] + '>`\n';
    const msgCleaned = await newMessage.reply( baseMsg + 'This message will self destruct in 15 seconds.' );
    for ( let seconds = 14; seconds > 0; seconds-- ) {
      setTimeout( () => { msgCleaned.edit( baseMsg + 'This message will self destruct in ' + seconds + ' seconds.' ); }, ( 15 - seconds ) * 1000 );
    }
    setTimeout( async () => { await msgCleaned.edit( baseMsg ).then( () => { msgCleaned.delete(); } ); }, 15000 );
  }
} );
