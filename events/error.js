const objTimeString = require( '../time.json' );
var strNow = () => { return ( new Date() ).toLocaleDateString( 'en-us', objTimeString ) };

module.exports = ( client, err ) => {
  console.error( '%o: ERROR: %o', strNow(), err );
  
  if ( err.code === 'ETIMEDOUT' ) {
    console.error( `${strNow()}\n\tFailed to connect to the Internet on: ${err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ]}` );
  } else if ( err.code ===  'ENOTFOUND' ) {
    console.error( `${strNow()}\n\tFailed to connect to Discord on: ${err.split( ' ' )[ ( err.split( ' ' ).length - 1 ) ]}` );
  } else {
    console.error( `${strNow()}:\n\tERROR: ${err}` );
  }
};
