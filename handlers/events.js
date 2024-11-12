const fs = require( 'fs' );
const chalk = require( 'chalk' );
const AsciiTable = require( 'ascii-table' );
const strScript = chalk.hex( '#FFA500' ).bold( './handlers/events.js' );

module.exports = ( client ) => {
  try {
    const table = new AsciiTable().setHeading( 'Events', 'Loaded' ).setBorder( '|', '=', "0", "0" ).setAlignCenter( 1 );
    fs.readdirSync( './events/' ).filter( ( file ) => file.endsWith( '.js' ) )
    .forEach( ( event ) => {
      require( `../events/${event}` );
      table.addRow( event.split( '.js' )[ 0 ], '✅' );
    } );
    console.log( chalk.greenBright( table.toString() ) );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};