const client = require( '..' );
const chalk = require( 'chalk' );

client.on( 'error', err => {
	console.error( '%s%s%s%s%s\n%o', chalk.bold.cyan.inverse( 'An unhandled error has occured [' ), err.code, chalk.bold.cyan.inverse( '] ' ), err.message, chalk.bold.cyan.inverse( ':' ), err );
} );