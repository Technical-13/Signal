const guildConfigDB = require( '../../models/GuildConfig.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType } = require( 'discord.js' );

module.exports = {
  name: 'say',
  name_localizations: {
    de: 'sagen',
    fr: 'dire',
    fi: 'sano',
    pl: 'mowić',
    'sv-SE': 'säga' },
  description: 'Make bot speak.',
  options: [ {
    name: 'saying',
    description: 'What do you want me to say?',
    required: true,
    type: 3
  }, {
    name: 'channel',
    description: 'Where do you want me to say it? (default: current channel)',
    type: 7
  } ],
  type: ApplicationCommandType.ChatInput,
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = [];
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const speakChannel = options.getChannel( 'channel' ) || channel;
    const mySaying = options.getString( 'saying' );
    const mentionsEveryone = /@(everyone|here)/g.test( mySaying );
    const strEveryoneHere = ( mentionsEveryone ? '`@' + ( /@everyone/g.test( mySaying ) ? 'everyone' : 'here' ) + '`' : null );
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( guild.ownerId );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const strAuthorTag = author.tag;
    const arrAuthorPermissions = ( objGuildMembers.get( author.id ).permissions.toArray() || [] );
    const hasAdministrator = ( ( isBotMod || isGuildOwner || arrAuthorPermissions.indexOf( 'Administrator' ) !== -1 ) ? true : false );
    const canEveryone = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'MentionEveryone' ) !== -1 ) ? true : false );
    const cmdAllowed = ( ( hasAdministrator || arrAuthorPermissions.indexOf( 'PrioritySpeaker' ) !== -1 ) ? true : false );
    var logChan = objGuildOwner;
    var logErrorChan = objGuildOwner;

    if ( !botOwner ) { return interaction.editReply( { content: 'You are not the boss of me...' } ); }

    if ( mySaying ) {
      guildConfigDB.findOne( { Guild: guild.id } ).then( async data => {
        if ( data ) {
          if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); }
          if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
        }
        let setupPlease = ( logChan == objGuildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );
        if ( cmdAllowed && ( !mentionsEveryone || canEveryone ) ) {
          speakChannel.send( mySaying ).then( async spoke => {
            interaction.editReply( { content: 'I said the thing!' } );

            logChan.send( 'I spoke in https://discord.com/channels/' + spoke.guild.id + '/' + spoke.channel.id + '/' + spoke.id + ' at <@' + author.id + '>\'s request:\n```\n' + mySaying + '\n```\n' + setupPlease )
              .catch( noLogChan => { console.error( 'logChan.send error in say.js:\n%o', noLogChan ) } );
          } ).catch( async muted => {
            switch ( muted.code ) {
              case 50001 :
                const noChan = '<#' + speakChannel + '>';
                await logErrorChan.send( 'Please give me permission to send to ' + noChan + '.\n' + setupPlease );
                await interaction.editReply( { content: 'I do not have permission to send messages in ' + noChan + '.' } );
                break;
              default:
                botOwner.send( 'Error attempting to speak as requested by: <@' + author.id + '>' +
                        ' from <#' + channel.id + '>:\n```\n' + muted + '\n```')
                  .then( notified => {
                  interaction.editReply( { content: 'Unknown error speaking. My owner, <@' + botOwner.id + '>, has been notified.' } );
                } ).catch( notNotified => {
                  interaction.editReply( { content: 'Unknown error speaking. Unable to notify my owner, <@' + botOwner.id + '>.' } );
                } );
                console.error( 'Unable to speak in say.js:\n\tCode: %o\n\tMsg: %o\n\tErr: %o', muted.code, muted.message, muted );
            }
          } );
        }
        else if ( mentionsEveryone && !canEveryone ) {
          logChan.send( '<@' + interaction.user.id + '> has no permission to get me to ' + strEveryoneHere + ' in <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```' + setupPlease )
            .catch( noLogChan => { console.error( 'mentionsEveryone logChan.send error in say.js:\n%o', noLogChan ) } );
          interaction.editReply( {
            content: 'You don\'t have permission to get me to ' + strEveryoneHere + ' in `' +
            guild.name + '`<#' + channel.id + '>.' } );
        } else {
          logChan.send( '<@' + author.id + '> has no permission to use my `/say` command from <#' + channel.id + '>. They tried to get me to say:\n```\n' + mySaying + '\n```\n' + setupPlease )
            .catch( noLogChan => { console.error( 'no permission logChan.send error in say.js:\n%o', noLogChan ) } );
          interaction.editReply( { content: 'You don\'t have permission to get me to speak in `' +
                      guild.name + '`<#' + channel.id + '>.' } );
        }
      } ).catch( err => { console.error( 'Encountered an error running say.js from %s:\n\t%o', guild.name, err ); } );
    } else { interaction.editReply( { content: 'I don\'t know what to say.' } ); }
  }
};