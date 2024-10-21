const { ApplicationCommandType } = require( 'discord.js' );
const userPerms = require( '../../functions/getPerms.js' );
const logChans = require( '../../functions/getLogChans.js' );
const errHandler = require( '../../functions/errorHandler.js' );

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
    const { channel, guild, options, user: author } = interaction;
    const { content } = await userPerms( author, guild, true );
    if ( content ) { return interaction.editReply( { content: content } ); }
    
    const { chanChat, doLogs, strClosing } = await logChans( guild );

    const cmdInputUser = options.getUser( 'target' );
    const mentionUserID = ( cmdInputUser ? cmdInputUser.id : author.id );
    const mentionUser = '<@' + mentionUserID + '>';
    const beNice = ( options.getBoolean( 'nice' ) || ( cmdInputUser === author ? true : false ) );
    const service = ( beNice ? 'www.google.com/search' : 'letmegooglethat.com/' );
    const strInputQuery = options.getString( 'query' );
    const q = encodeURI( strInputQuery.replace( / /g, '+' ) );
    
    if ( doLogs && mentionUserID != author.id ) {
      chanChat.send( { content: '<@' + author.id + '> sent ' + mentionUser + ' a `/lmgtfy` for [`' + strInputQuery + '`](<https://' + service + '?q=' + q + '>) in <#' + channel.id + '>, and they were ' + ( beNice ? '' : '**__not__** ' ) + 'nice.' } )
      .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'lmgtfy', guild: guild, type: 'logLogs' } ) ); } );
    }

    return interaction.reply( { content: mentionUser + ': <https://' + service + '?q=' + q + '>' } );
  }
};