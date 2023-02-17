const bot = process.env.REPL_SLUG;
const express = require( 'express' );
const replServer = express();
const objTimeString = require( '../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };


replServer.all( '/', ( req, res ) => { res.send( bot + ' was last restarted: ' + strNow() ); } );

function keepAlive() {
  var server = replServer.listen( 3000, () => {
    const port = server.address().port;
    console.log( '%s is ready on port: %s', bot, port );
  } );
}

module.exports = keepAlive;