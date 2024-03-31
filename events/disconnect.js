const objTimeString = require( '../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, dc ) => {
  console.log( `${strNow()}:\n\tI\'ve been disconnected with: ${dc}` );
};
