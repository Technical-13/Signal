// Source and more info : https://discordjs.guide/slash-commands
// List of valid locales: https://discord.com/developers/docs/reference#locales

const { SlashCommandBuilder } = require( '@discordjs/builders' );
const { REST } = require( '@discordjs/rest' );
const { Routes } = require( 'discord-api-types/v9' );
const clientId = '445799905177632768'; // <---- Enter your client ID here

const commands = [
	new SlashCommandBuilder()
    .setName( 'badgebar' )
    .setDescription( 'Show Project-GC BadgeBar for user.' )
    .setDescriptionLocalizations( {
      de: 'Project-GC BadgeBar für Benutzer anzeigen.',
      fi: 'Näytä Project-GC BadgeBar käyttäjälle.',
      pl: 'Pokaż pasek odznak Project-GC dla użytkownika.' } )
    .addStringOption( option =>
      option.setName( 'gc-name' )
        .setNameLocalizations( {
          de: 'gc-name',
          fr: 'nom-gc',
          fi: 'gc-nimi',
          pl: 'gc-name',
          'sv-SE': 'gc-namn' } )
        .setDescription( 'The case-sensitive Geocaching.com username.' )
        .setDescriptionLocalizations( {
          de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
          fi: 'Kirjainkoolla erottuva Geocaching.com-käyttäjänimi.',
          pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' } ) )
    .addUserOption( option =>
      option.setName( 'discord-user' )
        .setNameLocalizations( {
          de: 'discord-benutzer',
          fr: 'utilisateur-discord',
          fi: 'discord-käyttäjä',
          pl: 'discord-użytkownik',
          'sv-SE': 'discord-användare' } )
        .setDescription( 'Discord member (requires nickname to be set if different from GC name).' )
        .setDescriptionLocalizations( {
          de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
          fi: 'Discord-jäsen (vaatii lempinimen asettamisen, jos se on eri kuin GC-nimi).',
          pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' } ) ),
	new SlashCommandBuilder()
    .setName( 'ftf' )
    .setDescription( 'Tell someone how to get their FTF (First To Find) noticed on Project-GC' )
    .addStringOption( option =>
      option.setName( 'message-id' )
        .setDescription( 'Paste message ID here' ) )
    .addUserOption( option =>
      option.setName( 'target' )
       .setDescription( 'Tag someone in response' ) )
    .addStringOption( option =>
      option.setName( 'language' )
        .setNameLocalizations( {
          de: 'sprache',
          fi: 'kieli',
          fr: 'langue',
          no: 'språk',
          pl: 'język',
          'sv-SE': 'språk' } )
        .setDescription( 'Language to give information in.' )
        .setDescriptionLocalizations( {
          de: 'Sprache, um Informationen zu geben.',
          fi: 'Kieli, jolla tiedot annetaan.',
          fr: 'Langue dans laquelle donner des informations.',
          no: 'Språk å gi informasjon på.',
          pl: 'Język, w którym należy podawać informacje.',
          'sv-SE': 'Språk att ge information på.' } )
        .addChoices(
          { name: 'de', value: 'Deutsch/German' },
          { name: 'en', value: 'English (default)' },
          { name: 'fi', value: 'Suomalainen/Finnish' },
          { name: 'fr', value: 'Français/French' },
          { name: 'no', value: 'Norsk/Norwegian' },
          { name: 'pl', value: 'Polski/Polish' },
          { name: 'sv-SE', value: 'Svenska/Swedish' }
        ) ),
	new SlashCommandBuilder()
    .setName( 'lmgt' )
    .setDescription( 'Let Me Google That for you...' )
    .addStringOption( option =>
      option.setName( 'query' )
        .setDescription( 'What you want to search for.' )
        .setRequired( true ) )
    .addUserOption( option =>
      option.setName( 'target' )
       .setDescription( 'Tag someone in response' ) ),
	new SlashCommandBuilder()
    .setName( 'ping' )
    .setNameLocalizations( {
      de: 'klingeln',
      fr: 'ping',
      fi: 'ping',
      pl: 'świst',
      'sv-SE': 'ping' } )
    .setDescription( 'Replies with the bot\'s ping!' )
    .setDescriptionLocalizations( {
      de: 'Antworten mit dem Ping des Bots!',
      fi: 'Vastaa botin pingillä!',
      pl: 'Odpowiedzi z pingiem bota!' } ),	
	new SlashCommandBuilder()
    .setName( 'profilestats' )
    .setDescription( 'Show link to Project-GC ProfileStats for user.' )
    .setDescriptionLocalizations( {
      de: 'Link zu Project-GC ProfileStats für Benutzer anzeigen.',
      fi: 'Näytä käyttäjälle linkki Project-GC ProfileStatsiin.',
      pl: 'Pokaż link do Project-GC ProfileStats dla użytkownika.' } )
    .addStringOption( option =>
      option.setName( 'gc-name' )
        .setNameLocalizations( {
          de: 'gc-name',
          fr: 'nom-gc',
          fi: 'gc-nimi',
          pl: 'gc-name',
          'sv-SE': 'gc-namn' } )
        .setDescription( 'The case-sensitive Geocaching.com username.' )
        .setDescriptionLocalizations( {
          de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
          fi: 'Kirjainkoolla erottuva Geocaching.com-käyttäjänimi.',
          pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' } ) )
    .addUserOption( option =>
      option.setName( 'discord-user' )
        .setNameLocalizations( {
          de: 'discord-benutzer',
          fr: 'utilisateur-discord',
          fi: 'discord-käyttäjä',
          pl: 'discord-użytkownik',
          'sv-SE': 'discord-användare' } )
        .setDescription( 'Discord member (requires nickname to be set if different from GC name).' )
        .setDescriptionLocalizations( {
          de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
          fi: 'Discord-jäsen (vaatii lempinimen asettamisen, jos se on eri kuin GC-nimi).',
          pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' } ) ),
  new SlashCommandBuilder()
    .setName( 'react' )
    .setNameLocalizations( {
      de: 'reagieren',
      fr: 'réagir',
      fi: 'reagoida',
      pl: 'reagować',
      'sv-SE': 'reagera' } )
    .setDescription( 'Make bot react to a message.' )
    .addStringOption( option =>
      option.setName( 'message-id' )
        .setDescription( 'Paste message ID here' )
        .setRequired( true ) )
    .addStringOption( option =>
      option.setName( 'reaction' )
        .setDescription( 'How do you want me to react?' )
        .setRequired( true ) ),
  new SlashCommandBuilder()
    .setName( 'reply' )
    .setNameLocalizations( {
      de: 'antwort',
      fr: 'répondre',
      fi: 'vastaa',
      pl: 'odpowiedź',
      'sv-SE': 'svar' } )
    .setDescription( 'Make bot respond to message.' )
    .addStringOption( option =>
      option.setName( 'message-id' )
        .setDescription( 'Paste message ID here' )
        .setRequired( true ) )
    .addStringOption( option =>
      option.setName( 'response' )
        .setDescription( 'What do you want me to say in response?' )
        .setRequired( true ) ),
	new SlashCommandBuilder()
    .setName( 'roll' )
    .setNameLocalizations( {
      de: 'würfeln',
      fr: 'lancer-les-dés',
      fi: 'heitä-noppaa',
      pl: 'rzuć-kostką',
      'sv-SE': 'rulla-tärningen' } )
    .setDescription( 'Dice Roller' )
    .addIntegerOption( option =>
      option.setName( 'dice' )
       .setDescription( 'How many dice? (default: 1)' ) )
    .addIntegerOption( option =>
      option.setName( 'sides' )
       .setDescription( 'How many sides per die? (default: 6)' ) )
    .addIntegerOption( option =>
      option.setName( 'sets' )
        .setDescription( 'How many sets of dice? (default: 1)' ) )
    .addIntegerOption( option =>
      option.setName( 'modifier' )
       .setDescription( '± to final roll for each die? (default: 0)' ) ),
  new SlashCommandBuilder()
    .setName( 'say' )
    .setNameLocalizations( {
      de: 'sagen',
      fr: 'dire',
      fi: 'sanoa',
      pl: 'mowić',
      'sv-SE': 'säga' } )
    .setDescription( 'Make bot speak.' )
    .addStringOption( option =>
      option.setName( 'saying' )
        .setDescription( 'What do you want me to say?' )
        .setRequired( true ) )
    .addChannelOption( option =>
      option.setName( 'channel' )
        .setDescription( 'Where do you want me to say it? (default: current channel)' ) ),
  new SlashCommandBuilder()
    .setName( 'setup-log' )
    .setDescription( 'Set up log channels for this server.' )
    .addSubcommand( subcommand => subcommand
      .setName( 'default' )
      .setDescription( 'Channel to log all requests.' )
      .addChannelOption( option => option
        .setName( 'default-channel' )
        .setDescription( 'Default channel for all logs.' ) ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'react' )
      .setDescription( 'Channel to log `/react` requests.' )
      .addChannelOption( option => option
        .setName( 'react-channel' )
        .setDescription( 'Select channel:' )
        .setRequired( true ) ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'reply' )
      .setDescription( 'Channel to log `/reply` requests.' )
      .addChannelOption( option => option
        .setName( 'reply-channel' )
        .setDescription( 'Select channel:' )
        .setRequired( true ) ) )
    .addSubcommand( subcommand => subcommand
      .setName( 'say' )
      .setDescription( 'Channel to log `/say` requests.' )
      .addChannelOption( option => option
        .setName( 'say-channel' )
        .setDescription( 'Select channel:' )
        .setRequired( true ) ) ),	
	new SlashCommandBuilder()
    .setName( 'statbar' )
    .setDescription( 'Show Project-GC StatBar for user.' )
    .setDescriptionLocalizations( {
      de: 'Project-GC StatBar für Benutzer anzeigen.',
      fi: 'Näytä Project-GC StatBar käyttäjälle.',
      pl: 'Pokaż Project-GC StatBar dla użytkownika.'
    } )
    .addStringOption( option =>
      option.setName( 'gc-name' )
        .setNameLocalizations( {
          de: 'gc-name',
          fr: 'nom-gc',
          fi: 'gc-nimi',
          pl: 'gc-name',
          'sv-SE': 'gc-namn' } )
        .setDescription( 'The case-sensitive Geocaching.com username.' )
        .setDescriptionLocalizations( {
          de: 'Der Geocaching.com-Benutzername, bei dem die Groß-/Kleinschreibung beachtet werden muss.',
          fi: 'Kirjainkoolla erottuva Geocaching.com-käyttäjänimi.',
          pl: 'W nazwie użytkownika Geocaching.com rozróżniana jest wielkość liter.' } ) )
    .addUserOption( option =>
      option.setName( 'discord-user' )
        .setNameLocalizations( {
          de: 'discord-benutzer',
          fr: 'utilisateur-discord',
          fi: 'discord-käyttäjä',
          pl: 'discord-użytkownik',
          'sv-SE': 'discord-användare' } )
        .setDescription( 'Discord member (requires nickname to be set if different from GC name).' )
        .setDescriptionLocalizations( {
          de: 'Discord-Mitglied (erfordert das Festlegen eines Spitznamens, wenn dieser vom GC-Namen abweicht).',
          fi: 'Discord-jäsen (vaatii lempinimen asettamisen, jos se on eri kuin GC-nimi).',
          pl: 'Członek Discord (wymaga ustawienia pseudonimu, jeśli różni się od nazwy GC).' } ) )
].map( command => command.toJSON() );

const rest = new REST( { version: '9' } ).setToken( process.env.token );

rest.put( Routes.applicationCommands( clientId ), { body: commands } )
	.then( () => console.log( 'Successfully registered application commands.' ) )
	.catch( errPutRest => console.error( errPutRest.stack ) );

/*
Discord uses slash commands now, meaning all commands must be preconfigured and sent to Discord. The way this works is by adding this file which allows you to set up your files then send them. Read the link above, and enter command data before running this command in shell to get the commands to be published:

node deployCommands.js

*/
