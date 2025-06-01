const client = require( '..' );
const axios = require( 'axios' );
const cheerio = require( 'cheerio' );
const chalk = require( 'chalk' );
const botVerbosity = client.verbosity;
const strScript = chalk.hex( '#FFA500' ).bold( './functions/cacheinfo.js' );

module.exports = async ( gcCode ) => {
  try {
    let isUser = ( gcCode.slice( 0, 2 ) === 'PR' ? true : false );
    let isTB = ( gcCode.slice( 0, 2 ) === 'TB' ? true : false );
    const info = await axios( 'https://coord.info/' + gcCode ).then( response => {
      const $ = cheerio.load( response.data );
      let result = { code: gcCode, failed: true, error: 'Unknown Error' };
      let isPMO = ( $( 'head' ).find( 'meta[name="page_name"]' ).attr( 'content' ) === 'PMO Cache Upsell' ? true : false );;
      if ( isUser ) {
        result = {
          basic: ( $( '#ctl00_ProfileHead_ProfileHeader_lnkGiftSubscription' ).attr( 'title' ) === 'Gift Membership' ? true : false ),
          code: gcCode,
          failed: false,
          guid: $( '#ctl00_ProfileHead_ProfileHeader_lnkGiftSubscription' ).attr( 'href' ).split( '?' )[ 1 ].split( '&' ).filter( ( param ) => param.split( '=' )[ 0 ] === 'uguid' )[ 0 ].split( '=' )[ 1 ],
          username: $( '#ctl00_ProfileHead_ProfileHeader_lblMemberName' ).text()
        };
      }
      else if ( isTB ) {
        result = {
          collectable: !( / not /.test( $( '#ctl00_ContentBody_BugDetails_BugTBNum' ).parent()[ 0 ].previousElementSibling?.innerText ) ),
          distance: ( $( 'h4.BottomSpacing' ).text().match( /\((\d+\.?\d?mi)\)/ ) ? $( 'h4.BottomSpacing' ).text().match( /\((\d+\.?\d?mi)\)/ )[ 1 ] : null ),
          icon: $( '#ctl00_ContentBody_BugTypeImage' ).attr( 'src' ).match( /[\d]+\.gif/ )[ 0 ],
//          id: 0,
          logs: parseInt( $( 'li.pager-info' ).text().split( ' ' )[ 2 ] ),
          name: $( '#ctl00_ContentBody_lbHeading' ).text(),
          nameCO: $( '#ctl00_ContentBody_BugDetails_BugOwner' ).text(),
          ref: $( '#ctl00_ContentBody_BugDetails_BugTBNum > strong' ).text(),
          released: ( new Date( $( '#ctl00_ContentBody_BugDetails_BugReleaseDate' ).text() ) ),
          type: $( '#ctl00_ContentBody_BugTypeImage' ).attr( 'alt' ),
          watchers: ( !$( '#ctl00_ContentBody_WatchList' ).text() ? 0 : parseInt( $( '#ctl00_ContentBody_WatchList' ).text().split( ' ' )[ 2 ].replace( /,/g, '' ) ) )
        };
      }
      else if ( isPMO ) {
        var ctArr = $( 'svg.cache-icon' ).html().split( '#' )[ 1 ].split( '"' )[ 0 ].split( '-' );
        result = {
//          archived: ( $( '#ctl00_ContentBody_archivedMessage' ).length ? true : false ),
//          attributes: attributes,
          code: gcCode,
          difficulty: $( '#ctl00_ContentBody_lblDifficulty' ).next( 'span' ).text().trim(),
          disabled: ( ctArr[ ctArr.length - 1 ] === 'disabled' ? true : false ),
          failed: false,
          favorited: $( '#ctl00_ContentBody_lblFavoritePoints' ).next().text(),
//          hidden: ( new Date( $( '#ctl00_ContentBody_mcd2' ).text().split( '\n' )[ 3 ].trim() ) ),
//          trackables: trackables,
          name: $( 'div#ctl00_divContentMain > h1.heading-3' ).text().trim(),
          nameCO: $( '#ctl00_ContentBody_uxCacheBy' ).text().split( 'by' ).pop().trim(),
//          locked: ( $( '#ctl00_ContentBody_lockedMessage' ).length ? true : false ),
          pmo: true,
          size: $( '#ctl00_ContentBody_lblSize' ).next( 'span' ).text().trim(),
          terrain: $( '#ctl00_ContentBody_lblTerrain' ).next( 'span' ).text().trim(),
          type: $( '.li__cache-type' ).text().trim()
        };
      }
      else {
        var trackables = 0;
        if ( $( '#ctl00_ContentBody_uxTravelBugList_uxNoTrackableItemsLabel' ).length === 0 ) {
          if ( $( '#ctl00_ContentBody_uxTravelBugList_uxViewAllTrackableItems' ).text().match( /[0-9]+(,[0-9]+)*/ ) ) {
            trackables = parseInt( $( '#ctl00_ContentBody_uxTravelBugList_uxViewAllTrackableItems' ).text().match( /[0-9]+(,[0-9]+)*/ )[ 0 ].replace( /,/g, '' ) );
          }
          else {
            trackables = $( '#ctl00_ContentBody_uxTravelBugList_uxViewAllTrackableItems' ).parents( '.WidgetBody' ).find( 'ul > li' ).length;
          }
        }
        result = {
          archived: ( $( '#ctl00_ContentBody_archivedMessage' ).length ? true : false ),
          attributes: $( '#ctl00_ContentBody_detailWidget > .WidgetBody > img' ).filter( '[alt!="blank"]' )
            .map( ( a, attrib ) => { return $( attrib ).attr( 'src' ).split( '/images/attributes/' )[ 1 ].split( '.' )[ 0 ]; } ).get(),
          code: gcCode,
          difficulty: $( '#ctl00_ContentBody_uxLegendScale > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
          disabled: ( $( '#ctl00_ContentBody_disabledMessage' ).length ? true : false ),
          failed: false,
//          favorited: 0,
          hidden: ( new Date( $( '#ctl00_ContentBody_mcd2' ).text().split( '\n' )[ 3 ].trim() ) ),
          trackables: trackables,
          locked: ( $( '#ctl00_ContentBody_lockedMessage' ).length ? true : false ),
          name: $( '#ctl00_ContentBody_CacheName' ).text().trim(),
          nameCO: $( '#ctl00_ContentBody_mcd1 > a' ).text().trim(),
          pmo: false,
          size: $( '#ctl00_ContentBody_size > p > span > small' ).text().trim().replace( /[\(\)]/g, '' ),
          terrain: $( '#ctl00_ContentBody_Localize12 > img' ).attr( 'alt' ).split( ' ' )[ 0 ],
          type: $( 'a.cacheImage' ).attr( 'title' ).trim()
        };
      }
      return result;
    } ).catch( errGetPage => {
      switch ( errGetPage.status ) {
        case 404:
          return { code: gcCode, failed: true, error: ( isUser ? 'User' : ( isTB ? 'Trackable' : 'Cache' ) ) + ' page not found!', status: 404 };
        default:
          console.error( errGetPage );
          console.error( 'Error attempting to get page for - https://coord.info/%s - :\n%o', gcCode, errGetPage.stack );
          return { code: gcCode, failed: true, error: errGetPage.message, status: errGetPage.status, pageType: ( isUser ? 'User' : ( isTB ? 'Trackable' : 'Cache' ) ) };
      }
    } );
    return info;
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};