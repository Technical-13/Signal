const client = require( '..' );
const chalk = require( 'chalk' );

client.on( 'error', err => {
	console.error( '%s%s%s%s%s\n%o', chalk.bold.black.bgCyan( 'An unhandled error has occured [' ), err.code, chalk.bold.black.bgCyan( '] ' ), err.message, chalk.bold.black.bgCyan( ':' ), err );
} );