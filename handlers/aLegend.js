const AsciiTable = require( 'ascii-table' );
const chalk = require( 'chalk' );

module.exports = ( client ) => {
  const table = new AsciiTable()
    .setTitle( 'Legend' ).setBorder( '|', '=', "0", "0" )
    .setAlignCenter( 0 ).setAlignCenter( 1 ).setAlignCenter( 2 ).setAlignCenter( 3 ).setAlignCenter( 4 ).setAlignCenter( 5 ).setAlignCenter( 6 )
    .setHeading( [ 'Emoji', '⭕', '➰', '✅', '⛔', '❌', '❎' ] )
    .addRow( [ 'Result', 'Disabled', 'Restricted', 'Success', 'Failure', 'ERROR!', 'Unchanged' ] );
  console.log( chalk.magenta( table.toString() ) );
};
