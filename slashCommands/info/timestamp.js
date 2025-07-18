const config = require( '../../config.json' );
const wmfWikiEndpoint = 'https://api.wikimedia.org/w/api.php?origin=*';
const chalk = require( 'chalk' );
const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const getGuildConfig = require( '../../functions/getGuildDB.js' );
const userPerms = require( '../../functions/getPerms.js' );
const strScript = chalk.hex( '#FFA500' ).bold( './slashCommands/info/timestamp.js' );

const validateInput = async function ( input ) {
  var validateInputURL = wmfWikiEndpoint;
  const params = {
    action: 'parse',
    format: 'json',
    text: '{'+'{#time:U|' + input + '}'+'}',
    disablelimitreport: 1,
    contentmodel: 'wikitext',
    formatversion: '2'
  };
  Object.keys( params ).forEach( key => { validateInputURL += '&' + encodeURIComponent( key ) + '=' + encodeURIComponent( params[ key ] ); } );
  return fetch( validateInputURL ).then( resParsedData => { return resParsedData.json(); } ).then( data => {
    if ( data.parse.text.includes( 'Invalid time' ) ) {
      return 'INVALID';
    }
    else {
      return data.parse.text.match( /<p>([\d]*)\n<\/p>/ )[ 1 ];
    }
  } ).catch( parseErr => {
    console.log( 'Error attempting to validateInput( \'%s\' ) with params: %o\nReturned: %o ', input, params, parseErr );
    return 'ERROR';
  } );
}

module.exports = {
  name: 'timestamp',
  description: 'Get dynamic timestamps for Discord.',
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.Guild ],
  group: 'info',
  options: [
    { type: 3, name: 'datetime', description: 'When do you want a timestamp for?', required: true }
  ],
  cooldown: 1000,
  run: async ( client, interaction ) => {
    await interaction.deferReply( { ephemeral: true } );
    const { channel, guild, options, user: member } = interaction;
    const { isGlobalBlacklisted, content } = await userPerms( member, guild );

    try {
      const input = options.getString( 'datetime', true );
      const timestamp = await validateInput( input );
      if ( timestamp === 'INVALID' ) { return interaction.editReply( { content: 'I am unable to parse a date or time from `' + input + '`.  Please try again.' } ); }
      if ( timestamp === 'ERROR' ) { return interaction.editReply( { content: 'I encountered an error attempting to parse a date or time from `' + input + '`.  Please try again later.' } ); }
      return interaction.editReply( { content:
        'Your timestamps for `' + input + '` are as follows:\n\n' +
        '`<t:' + timestamp + ':t>` :arrow_right: <t:' + timestamp + ':t>\n' +
        '`<t:' + timestamp + ':T>` :arrow_right: <t:' + timestamp + ':T>\n' +
        '`<t:' + timestamp + ':d>` :arrow_right: <t:' + timestamp + ':d>\n' +
        '`<t:' + timestamp + ':D>` :arrow_right: <t:' + timestamp + ':D>\n' +
        '`<t:' + timestamp + ':f>` :arrow_right: <t:' + timestamp + ':f>\n' +
        '`<t:' + timestamp + ':F>` :arrow_right: <t:' + timestamp + ':F>\n' +
        '`<t:' + timestamp + ':R>` :arrow_right: <t:' + timestamp + ':R>'
      } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
};