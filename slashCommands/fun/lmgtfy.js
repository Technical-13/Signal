const { ApplicationCommandType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const niceDefault = true;// Should the bot be nice by default?
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/fun/lmgtfy.js' );

module.exports = {
  name: 'lmgtfy',
  group: 'fun',
  description: 'Let Me Google That For You!',
  type: ApplicationCommandType.ChatInput,
  options: [// query, target, nice
    { type: 3, name: 'query', description: 'What do you want me to look up?', required: true },
    { type: 6, name: 'target', description: 'Who should I mention with my response? (Default: yourself)' },
    { type: 5, name: 'nice', description: 'Should I be nice?' }
  ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const { doLogs, chanChat, strClosing } = await getGuildConfig( guild );
      const cmdInputUser = options.getUser( 'target' );
      const mentionUserID = ( cmdInputUser ? cmdInputUser.id : author.id );
      const mentionUser = '<@' + mentionUserID + '>';
      const beNice = ( options.getBoolean( 'nice' ) || ( cmdInputUser === author ? niceDefault : !niceDefault ) );
      const service = ( beNice ? 'www.google.com/search' : 'letmegooglethat.com/' );
      const strInputQuery = options.getString( 'query' );
      const q = encodeURI( strInputQuery.replace( / /g, '+' ) );

      channel.send( { content: mentionUser + ': <https://' + service + '?q=' + q + '>' } )
      .then( sentMsg => {
        if ( doLogs && mentionUserID != author.id ) {
          chanChat.send( { content: '<@' + author.id + '> sent ' + mentionUser + ' a `/lmgtfy` for [`' + strInputQuery + '`](<https://' + service + '?q=' + q + '>) in <#' + channel.id +
          '>, and they were ' + ( beNice ? '' : '**__not__** ' ) + 'nice.' } )
          .then( sentLog => { interaction.deleteReply(); } )
          .catch( async errLog => { await errHandler( errLog, { chanType: 'chat', command: strScript, channel: channel, type: 'logLogs' } ); } );
        }
        else { interaction.deleteReply(); }
      } )
      .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: strScript, channel: channel, type: 'errSend' } ) ); } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};