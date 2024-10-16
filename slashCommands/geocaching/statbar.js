const guildConfigDB = require( '../../models/GuildConfig.js' );
const { model, Schema } = require( 'mongoose' );
const { ApplicationCommandType } = require( 'discord.js' );

module.exports = {
  name: 'statbar',
  description: 'Show Project-GC StatBar for user.',
  description_localizations: {
    de: 'Project-GC StatBar für Benutzer anzeigen.',
    fi: 'Näytä Project-GC StatBar käyttäjälle.',
    pl: 'Pokaż Project-GC StatBar dla użytkownika.'
  },
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
  }, {
    name: 'labcaches',
    description: 'Should I include labcaches? (default: true)',
    type : 5
  } ],
  type: ApplicationCommandType.ChatInput,
  cooldown: 3000,
  run: async ( client, interaction ) => {
    await interaction.deferReply();
    const { channel, guild, options } = interaction;
    const author = interaction.user;
    const botOwner = client.users.cache.get( process.env.OWNER_ID );
    const isBotOwner = ( author.id === botOwner.id ? true : false );
    const botMods = [];
    const isBotMod = ( ( botOwner || botMods.indexOf( author.id ) != -1 ) ? true : false );
    const objGuildMembers = guild.members.cache;
    const objGuildOwner = objGuildMembers.get( interaction.guild.ownerId );
    const isGuildOwner = ( author.id === objGuildOwner.id ? true : false );
    const arrAuthorPermissions = ( guild.members.cache.get( author.id ).permissions.toArray() || [] );
    var logChan = objGuildOwner;
    var logErrorChan = objGuildOwner;    

    const today = ( new Date() );
    const intYear = today.getFullYear();
    const intMonthNow = today.getMonth();
    const intMonth = ( intMonthNow < 9 ? '0' : '' ) + ( intMonthNow + 1 ).toString();
    const intDayNow = today.getDate();
    const intDay = ( intDayNow <= 9 ? '0' : '' ) + intDayNow.toString();

    const strAuthorDisplayName = objGuildMembers.get( author.id ).displayName;
    const strInputUser = ( options.getString( 'gc-name' ) || null );
    const objInputUser = ( options.getUser( 'discord-user' ) || null );
    const strInputUserDisplayName = ( objInputUser ? objInputUser.displayName : strInputUser );
    const strUseName = ( strInputUserDisplayName ? strInputUserDisplayName : strAuthorDisplayName );
    const encName = encodeURI( strUseName ).replace( '&', '%26' );
		const strLabcaches = ( options.getBoolean( 'labcaches' ) ? '&includeLabcaches' : '' );
    let setupPlease = ( logChan == objGuildOwner ? 'Please run `/config` to have these logs go to a channel in the server instead of your DMs.' : '----' );

    guildConfigDB.findOne( { Guild: guild.id } ).then( async data => {
      if ( data.Logs ) {
        if ( data.Logs.Chat ) { logChan = await guild.channels.cache.get( data.Logs.Chat ); }
        if ( data.Logs.Error ) { logErrorChan = guild.channels.cache.get( data.Logs.Error ); }
      }

      interaction.editReply( { content: 'StatBar for: ' + ( objInputUser == null ? strUseName : '<@' +  objInputUser + '>' ) + '\nhttps://cdn2.project-gc.com/statbar.php?quote=https://discord.me/Geocaching%20-%20' + intYear + '-' + intMonth + '-' + intDay + strLabcaches + '&user=' + encName } );
    } );
  }
};