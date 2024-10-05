const client = require( '..' );
const chalk = require( 'chalk' );

client.on( 'error', err => {
	console.error( chalk.bold.red.bgYellowBright( `An unknown error has occured [${err.code}]: ${err.message}\n${err}` ) );
} );