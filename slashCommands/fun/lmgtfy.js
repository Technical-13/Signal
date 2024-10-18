const { ApplicationCommandType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'lmgtfy',
  description: 'Let Me Google That For You!',
  type: ApplicationCommandType.ChatInput,
  options: [ {
    name: 'query',
    description: 'What do you want me to look up?',
    required: true,
    type: 3
  }, {
    name: 'target',
    description: 'Who should I mention with my response? (Default: yourself)',
    type: 6
  }, {
    name: 'nice',
    description: 'Should I be nice?',
    type: 5
  } ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const { botOwner, isBotMod, isBlacklisted, isGlobalWhitelisted, guildOwner, isGuildBlacklisted } = await userPerms( client, author, guild );
    if ( isBlacklisted && !isGlobalWhitelisted ) {
      let contact = ( isGuildBlacklisted ? guildOwner.id : botOwner.id );
      return message.reply( { content: 'Oh no!  It looks like you have been blacklisted from using my commands' + ( isGuildBlacklisted ? ' in this server.' : '.' ) + '!  Please contact <@' + contact + '> to resolve the situation.' } );
    }
    else if ( isBotMod && isGuildBlacklisted ) {
      author.send( 'You have been blacklisted from using commands in https://discord.com/channels/' + guild.id + '/' + channel.id + '! Use `/config remove` to remove yourself from the blacklist.' );
    }

    const cmdInputUser = options.getUser( 'target' );
    const mentionUser = '<@' + ( cmdInputUser ? cmdInputUser.id : author.id ) + '>: ';
    const beNice = ( options.getBoolean( 'nice' ) || ( cmdInputUser === author ? true : false ) );
    const service = ( beNice ? 'www.google.com/search' : 'letmegooglethat.com/' );
    const strInputQuery = options.getString( 'query' );
    const q = encodeURI( strInputQuery.replace( / /g, '+' ) );

    interaction.reply( { content: mentionUser + '<https://' + service + '?q=' + q + '>' } );
  }
};