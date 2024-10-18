const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const { model, Schema } = require( 'mongoose' );
const guildConfigDB = require( '../../models/GuildConfig.js' );
const userPerms = require( '../../functions/getPerms.js' );

module.exports = {
  name: 'badgebar',
  description: 'Show Project-GC BadgeBar for user.',
  description_localizations: {
    de: 'Project-GC BadgeBar für Benutzer anzeigen.',
    fi: 'Näytä Project-GC BadgeBar käyttäjälle.',
    pl: 'Pokaż pasek odznak Project-GC dla użytkownika.' },
  options: [ {
    name: 'gc-name',
    name_localizations: {
      de: 'gc-name',
      fr: 'nom-gc',
      fi: 'gc-nimi',
      pl: 'gc-name',
      'sv-SE': 'gc-namn' },
    description: 'The case-sensitive Geocaching.com username.',
    description_localizations: {
      de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
      fi: 'Geocaching.com-käyttäjänimi, kirjainkoko merkitsevä.',
      pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' },
    type: 3
  }, {
    name: 'discord-user',
    name_localizations: {
      de: 'discord-benutzer',
      fr: 'utilisateur-discord',
      fi: 'discord-käyttäjä',
      pl: 'discord-użytkownik',
      'sv-SE': 'discord-användare' },
    description: 'Discord member (requires nickname to be set if different from GC name).',
    description_localizations: {
      de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
      fi: 'Discord-jäsen (vaatii nimimerkin asettamisen, jos se on eri kuin GC-nimi).',
      pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' },
    type: 6
  } ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply();
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

    const today = ( new Date() );
    const intYear = today.getFullYear();
    const intMonthNow = today.getMonth();
    const intMonth = ( intMonthNow < 9 ? '0' + ( intMonthNow + 1 ).toString() : ( intMonthNow + 1 ).toString() );
    const intDayNow = today.getDate();
    const intDay = ( intDayNow <= 9 ? '0' + intDayNow.toString() : intDayNow.toString() );

    const objGuildMembers = guild.members.cache;
    const strAuthorDisplayName = objGuildMembers.get( author.id ).displayName;
    const strInputUser = ( options.getString( 'gc-name' ) || null );
    const objInputUser = ( options.getUser( 'discord-user' ) || null );
    const strInputUserDisplayName = ( objInputUser ? objInputUser.displayName : strInputUser );
    const strUseName = ( strInputUserDisplayName ? strInputUserDisplayName : strAuthorDisplayName );
    const encName = encodeURI( strUseName ).replace( '&', '%26' );

    var logChan = guildOwner;
    var logErrorChan = guildOwner;

    guildConfigDB.findOne( { Guild: guild.id } ).then( async data => {
      if ( data ) {
        if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Default ); }
        if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
      }
      let setupPlease = ( logChan == guildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );

      interaction.editReply( { content: 'BadgeBar for: ' + ( objInputUser == null ? strUseName : '<@' +  objInputUser + '>' ) + '\nhttps://cdn2.project-gc.com/BadgeBar/' + encName + '.png#' + intYear + '-' + intMonth + '-' + intDay } );
    } );
  }
};