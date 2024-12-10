const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const userConfig = require( '../../models/BotUser.js' );
const errHandler = require( '../../functions/errorHandler.js' );
const userPerms = require( '../../functions/getPerms.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const objTimeString = require( '../../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/admin/ban.js' );

module.exports = {
  name: 'ban',
  group: 'admin',
  description: 'Ban a user.',
  options: [
    { type: 6, name: 'member', description: 'Select a member to ban.', required: true },
    { type: 4, name: 'delete', description: 'Delete messages back for:', choices: [
      { name: 'None', value: 0 },
      { name: 'One hour', value: 3600 },
      { name: 'Three hours', value: 10800 },
      { name: 'Six hours', value: 21600 },
      { name: 'Half day', value: 43200 },
      { name: 'One day', value: 86400 },
      { name: 'Three days', value: 259200 },
      { name: 'Five days', value: 432000 },
      { name: 'One week', value: 604800 }
    ] },
    { type: 3, name: 'reason', description: 'Reason for the ban.' },
    /*{ type: 4, name: 'duration', description: 'Duration of the ban.', choices: [
      { name: 'Indefinite', value: 0 }
    ] }//*/
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    try {
      await interaction.deferReply( { ephemeral: true } );
      const { channel, guild, options, user: author } = interaction;
      const { isBotMod, checkPermission, content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const canBan = ( isBotMod || checkPermission( 'BanMembers' ) ? true : false );
      const banMember = options.getUser( 'member' );
      const deleteDuration = ( options.getInteger( 'delete' ) || 0 );
      const banReason = ( options.getString( 'reason' ) || 'Just for fun!' );
      // const softBanDuration = ( options.getInteger( 'duration' ) || 0 );

      const { doLogs, chanDefault, strClosing } = await getGuildConfig( guild );
      if ( author.id != banMember.id && !canBan ) {
        if ( doLogs ) {
          chanDefault.send( { content: '<@' + author.id + '> tried to get me to ban <@' + banMember.id + '> and doesn\'t have permission to do that.' } )
          .catch( async noLogChan => { return interaction.editReply( await errHandler( noLogChan, { chanType: 'chat', command: 'ban', channel: channel, type: 'logLogs' } ) ); } );
        }
        return interaction.editReply( { content: 'You don\'t have permission to have me ban that member.' } );
      }
      else if ( !banMember.bannable ) { return interaction.editReply( { content: 'I am unable to ban that member.' } ); }
      else if ( author.id != banMember.id ) {
        banMember.send( { content: 'OMG!!! You just banned yourself from **' + guild.name + '**!!!' } )
        .then( async sentMsg => {
          const msgBanned = await channel.send( { content: '<@' + banMember.id + '> just banned themself from this server! *(Don\'t worry, they can come back in five minutes...)*' } );
          setTimeout( () => {
            msgBanned.delete().catch( async errDelete => { interaction.editReply( await errHandler( errDelete, { command: 'ban', channel: channel, type: 'errDelete' } ) ); } );
            //send them an invite to come back
          }, 300000 );
          if ( doLogs ) { chanDefault.send( { content: '<@' + banMember.id + '> just banned themself from this server for five minutes!' } ); }
          banMember.ban( { deleteMessageSeconds: 0, reason: 'They banned themself!' } )
          .catch( async errBan => { interaction.editReply( await errHandler( errBan, { command: 'ban', channel: channel, type: 'errBan' } ) ); } );
        } )
        .catch( async errSend => { interaction.editReply( await errHandler( errSend, { command: 'ban', channel: channel, type: 'errSend' } ) ); } );
      }
      else {
        banMember.ban( { deleteMessageSeconds: deleteDuration, reason: strNow() + ' - ' + author.displayName + ': ' + banReason } )
        .catch( async errBan => { interaction.editReply( await errHandler( errBan, { command: 'ban', channel: channel, type: 'errBan' } ) ); } );
      }
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};