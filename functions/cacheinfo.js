const axios = require( 'axios' );
const cheerio = require( 'cheerio' );

module.exports = async ( gcCode ) => {
  const info = await axios( 'https://coord.info/' + gcCode ).then( response => {
    const $ = cheerio.load( response.data );
    let result = { code: gcCode, failed: true, error: 'Unknown Error' };
    let isPMO = ( $( 'head' ).find( 'meta[name="page_name"]' ).attr( 'content' ) === 'PMO Cache Upsell' ? true : false );;
    if ( isPMO ) {
      result = {
        code: gcCode,
        failed: false,
        type: $( '.li__cache-type' ).text().trim(),
        name: $( 'div#ctl00_divContentMain > h1.heading-3' ).text().trim(),
        nameCO: $( '#ctl00_ContentBody_uxCacheBy' ).text().split( 'by' ).pop().trim(),
        difficulty: $( '#ctl00_ContentBody_lblDifficulty' ).next( 'span' ).text().trim(),
        terrain: $( '#ctl00_ContentBody_lblTerrain' ).next( 'span' ).text().trim(),
        size: $( '#ctl00_ContentBody_lblSize' ).next( 'span' ).text().trim(),
//        disabled: ( $( '#ctl00_ContentBody_disabledMessage' ).length ? true : false ),
//        archived: ( $( '#ctl00_ContentBody_archivedMessage' ).length ? true : false ),
        pmo: true
      };
    } else {
      result = {
        code: gcCode,
        failed: false,
        type: $( 'a.cacheImage' ).attr( 'title' ).trim(),
        name: $( '#ctl00_ContentBody_CacheName' ).text().trim(),
        nameCO: $( '#ctl00_ContentBody_mcd1 > a' ).text().trim(),
        difficulty: $( '#ctl00_ContentBody_uxLegendScale > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
        terrain: $( '#ctl00_ContentBody_Localize12 > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
        size: $( '#ctl00_ContentBody_size > p > span > small' ).text().trim().replace( /[\(\)]/g, '' ),
        disabled: ( $( '#ctl00_ContentBody_disabledMessage' ).length ? true : false ),
        archived: ( $( '#ctl00_ContentBody_archivedMessage' ).length ? true : false ),
        pmo: false
      };
    }
    return result;
  } ).catch( errGetPage => {
    switch ( errGetPage.status ) {
      case 404:
        return { code: gcCode, failed: true, error: 'Cache page not found!', status: 404 };
      default:
        console.error( 'Error attempting to get page for - https://coord.info/%s - :\n%o', gcCode, errGetPage );
        return { code: gcCode, failed: true, error: errGetPage.statusText, status: errGetPage.status };
    }
  } );
  return info;
};
