const axios = require( 'axios' );
const cheerio = require( 'cheerio' );

module.exports = async ( gcCode ) => {
  const info = await axios( 'https://coord.info/' + gcCode ).then( response => {
    const $ = cheerio.load( response.data );
    const result = {
      code: gcCode,
      type: $( 'a.cacheImage' ).attr( 'title' ).trim(),
      name: $( '#ctl00_ContentBody_CacheName' ).text().trim(),
      nameCO: $( '#ctl00_ContentBody_mcd1 > a' ).text().trim(),
      urlCO: $( '#ctl00_ContentBody_mcd1 > a' ).attr( 'href' ).trim(),
      difficulty: $( '#ctl00_ContentBody_uxLegendScale > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
      terrain: $( '#ctl00_ContentBody_Localize12 > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
      hidden: ( new Date( Date.parse( $( '#ctl00_ContentBody_mcd2' ).text().trim().split( ' ' ).pop() ) ) ),
      size: $( '#ctl00_ContentBody_size > p > span > small' ).text().trim().replace( /[\(\)]/g, '' )
    };
    
    return result;
  } );
  return info;
};
