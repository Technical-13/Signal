const chalk = require( 'chalk' );
const fs = require( 'fs' );
const AsciiTable = require( 'ascii-table' );

module.exports = ( client ) => {
  const prefix = client.prefix;
  const table = new AsciiTable().setBorder( '|', '=', "0", "0" )
  .setHeading( 'Group', prefix + 'Command', 'Loaded' )
  .setAlignRight( 0 ).setAlignLeft( 1 ).setAlignCenter( 2 );
  fs.readdirSync( './commands/' ).forEach( dir => {
    const files = fs.readdirSync( `./commands/${dir}/` ).filter( file => file.endsWith( '.js' ) );
    if ( !files || files.legnth <= 0 ) { console.log( chalk.red( `Command directory, ${dir}, is empty!` ) );}
    files.forEach( ( file ) => {
      let command = require( `../commands/${dir}/${file}` );
      const cmdName = file.split( '.js' )[ 0 ];
      if ( command ) {
        client.commands.set( command.name, command )
        if ( command.aliases && Array.isArray( command.aliases ) ) { command.aliases.forEach( alias => { client.aliases.set( alias, command.name ) } ); }
        if ( command.ownerOnly || command.modOnly ) { table.addRow( dir, cmdName, '➰' ); }
        else { table.addRow( dir, cmdName, '✅' ); } }
      else { table.addRow( dir, file, '⛔' ); }
    } );
  } );
  console.log( chalk.blue( table.toString() ) );
};
