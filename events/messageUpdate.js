const client = require( '..' );
const { EmbedBuilder, Collection, PermissionsBitField } = require( 'discord.js' );
const ms = require( 'ms' );
const CLIENT_ID = process.env.CLIENT_ID;
const DEV_GUILD_ID = process.env.DEV_GUILD_ID;
const OWNER_ID = process.env.OWNER_ID;

client.on( 'messageUpdate', async message => {
  const { author, channel, content, guild, mentions } = message;
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
    'Geocaching: Join the world\'s largest treasure hunt.'
  ];
  const arrJunkEmbedURLs = [];
  const hasJunkEmbed = ( message.embeds.find( embed => {
    for ( const title of arrJunkEmbedTitles ) {
      if ( embed.title === title ) {
        arrJunkEmbedURLs.push( embed.url );
        return embed;
      };
    }
  } ) ? true : false );
  
  if ( hasJunkEmbed ) {
    message.suppressEmbeds( true );
    const msgCleaned = await message.reply( '<@' + author.id + '>, I cleaned the embeds from your message.\nTo avoid this in the future, please wrap links like `<`' + arrJunkEmbedURLs[ 0 ] + '`>`' );
    msgCleaned.delete( 5000 );
  }
} );
