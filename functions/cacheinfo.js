const axios = require( 'axios' );
const cheerio = require( 'cheerio' );

module.exports = async ( gcCode ) => {
  const info = await axios( 'https://coord.info/' + gcCode ).then( response => {
    const $ = cheerio.load( response.data );
    let result = {};
    if ( $( '.premium-upgrade-widget' ) ) {
      result = {
        code: gcCode,
        type: $( '.li__cache-type' ).text().trim(),
        name: $( 'div#ctl00_divContentMain > h1.heading-3' ).text().trim(),
        nameCO: $( '#ctl00_ContentBody_uxCacheBy' ).text().split( 'by' ).pop().trim(),
//        urlCO: $( '' ).trim(),// Not listed
        difficulty: $( '#ctl00_ContentBody_lblDifficulty' ).find( 'span' ).eq( 1 ).text().trim(),
        terrain: $( '#ctl00_ContentBody_lblTerrain' ).find( 'span' ).eq( 1 ).text().trim(),
        size: $( '#ctl00_ContentBody_lblSize' ).find( 'span' ).eq( 1 ).text().trim(),
//        hidden: ( new Date( Date.parse( $( '' ).trim() ) ) ),// Not listed
//        disabled: ( $( '#ctl00_ContentBody_disabledMessage' ) ? true : false ),
//        archived: ( $( '#ctl00_ContentBody_archivedMessage' ) ? true : false ),
        poc: true
      };
    } else {
      result = {
        code: gcCode,
        type: $( 'a.cacheImage' ).attr( 'title' ).trim(),
        name: $( '#ctl00_ContentBody_CacheName' ).text().trim(),
        nameCO: $( '#ctl00_ContentBody_mcd1 > a' ).text().trim(),
        urlCO: $( '#ctl00_ContentBody_mcd1 > a' ).attr( 'href' ).trim(),
        difficulty: $( '#ctl00_ContentBody_uxLegendScale > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
        terrain: $( '#ctl00_ContentBody_Localize12 > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
        hidden: ( new Date( Date.parse( $( '#ctl00_ContentBody_mcd2' ).text().trim().split( ' ' ).pop() ) ) ),
        size: $( '#ctl00_ContentBody_size > p > span > small' ).text().trim().replace( /[\(\)]/g, '' ),
        disabled: ( $( '#ctl00_ContentBody_disabledMessage' ) ? true : false ),
        archived: ( $( '#ctl00_ContentBody_archivedMessage' ) ? true : false ),
        poc: false
      };
    }
    return result;
  } ).catch( errGetPage => {
    console.error( 'Error attempting to get page for - https://coord.info/%s - :\n%o', gcCode, errGetPage );
  } );
  return info;
};
