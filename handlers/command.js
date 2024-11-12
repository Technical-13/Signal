const fs = require( 'fs' );
const chalk = require( 'chalk' );
const AsciiTable = require( 'ascii-table' );
const strScript = chalk.hex( '#FFA500' ).bold( './handlers/command.js' );

module.exports = ( client ) => {
  try {
    const prefix = client.prefix;
    const table = new AsciiTable().setBorder( '|', '=', "0", "0" )
    .setHeading( 'Group', prefix + 'Command', 'Loaded' )
    .setAlignRight( 0 ).setAlignLeft( 1 ).setAlignCenter( 2 );

    const cmdGroups = {};
    fs.readdirSync( './commands/' ).forEach( dir => {
      const files = fs.readdirSync( `./commands/${dir}/` ).filter( file => file.endsWith( '.js' ) );
      if ( !files || files.length <= 0 ) { console.log( chalk.red( `Command directory, ${dir}, is empty!` ) );}
      else {
        const cmdGroup = [];
        files.forEach( ( file ) => {
          let command = require( `../commands/${dir}/${file}` );
          const cmdName = file.split( '.js' )[ 0 ];
          if ( command ) {
            command.group = dir;
            cmdGroup.push( command.name );
            client.commands.set( command.name, command );
            if ( command.aliases && Array.isArray( command.aliases ) ) { command.aliases.forEach( alias => {
              cmdGroup.push( alias );
              client.aliases.set( alias, command.name );
            } ); }
            if ( command.ownerOnly || command.modOnly ) { table.addRow( dir, cmdName, '➰' ); }
            else { table.addRow( dir, cmdName, '✅' ); } }
          else { table.addRow( dir, file, '⛔' ); }
        } );
        cmdGroup.sort();
        cmdGroups[ dir ] = cmdGroup;
      }
      client.groups.set( 'prefixCmds', cmdGroups );
    } );
    console.log( chalk.blue( table.toString() ) );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};