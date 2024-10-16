const express = require( 'express' );
const expressServer = express();
const objTimeString = require( '../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

expressServer.all( '/', ( req, res ) => { res.send( bot + ' was last restarted: ' + strNow() ); } );

function keepAlive() {
  const bot = ( process.env.BOT_USERNAME || 'Server' );
  var server = expressServer.listen( 3000, () => {
    const port = server.address().port;
    console.log( '%s is ready on port %s.', bot, port );
  } );
}

module.exports = keepAlive;