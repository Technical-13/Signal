require( 'dotenv' ).config();
const ENV = process.env;
const express = require( 'express' );
const expressServer = express();
const bot = ( ENV.BOT_USERNAME || 'Server' );
const botPort = ( ENV.PORT || 3000 );
const objTimeString = require( '../jsonObjects/time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

expressServer.all( '/', ( req, res ) => { res.send( bot + ' was last restarted: ' + strNow() ); } );

function keepAlive() {
  var server = expressServer.listen( botPort, () => {
    const port = server.address().port;
    console.log( '%s is ready on port %s.', bot, port );
  } );
}

module.exports = keepAlive;