const client = require( '..' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/duraction.js' );

module.exports = async ( ms, getUnits = { getDecades: false, getYears: false, getMonths: false, getWeeks: false, getDays: true, getHours: true, getMinutes: true, getSeconds: false }, debug = false ) => {
  try {
    if ( debug ) { console.warn( 'functions/duration.js recieved options: %o', { ms: ms, getUnits: getUnits } ); }
    if ( isNaN( ms ) ) { return '∅ms'; }
    const objUnits = ( !getUnits ? { xs: false, yrs: false, mos: false, wks: false, days: true, hrs: true, min: true, secs: false } : {
      xs: ( typeof getUnits.getDecades != 'boolean' ? false : getUnits.getDecades ),
      yrs: ( typeof getUnits.getYears != 'boolean' ? false : getUnits.getYears ),
      mos: ( typeof getUnits.getMonths != 'boolean' ? false : getUnits.getMonths ),
      wks: ( typeof getUnits.getWeeks != 'boolean' ? false : getUnits.getWeeks ),
      days: ( typeof getUnits.getDays != 'boolean' ? true : getUnits.getDays ),
      hrs: ( typeof getUnits.getHours != 'boolean' ? true : getUnits.getHours ),
      min: ( typeof getUnits.getMinutes != 'boolean' ? true : getUnits.getMinutes ),
      secs: ( typeof getUnits.getSeconds != 'boolean' ? false : getUnits.getSeconds )
    } );
    if ( debug ) { console.warn( 'functions/duration.js processed options: %o', { ms: ms, objUnits: objUnits } ); }
    if ( objUnits.xs || objUnits.yrs || objUnits.mos || objUnits.wks || objUnits.days || objUnits.hrs || objUnits.min || objUnits.secs ) {
      var intDecades = 0, intYears = 0, intMonths = 0, intWeeks = 0, intDays = 0, intHours = 0, intMinutes = 0, intSeconds = 0;
      var totalSeconds = ( ms / 1000 );
      if ( objUnits.xs ) {
        intDecades = Math.floor( totalSeconds / 315569520 );
        totalSeconds %= 315569520;
      }
      if ( objUnits.yrs ) {
        intYears = Math.floor( totalSeconds / 31556952 );
        totalSeconds %= 31556952;
      }
      if ( objUnits.mos ) {
        intMonths = Math.floor( totalSeconds / 2629746 );
        totalSeconds %= 2629746;
      }
      if ( objUnits.wks && ( intDecades + intYears + intMonths ) === 0 ) {
        intWeeks = Math.floor( totalSeconds / 604800 );
        totalSeconds %= 604800;
      }
      if ( objUnits.days ) {
        intDays = Math.floor( totalSeconds / 86400 );
        totalSeconds %= 86400;
      }
      if ( objUnits.hrs ) {
        intHours = Math.floor( totalSeconds / 3600 );
        totalSeconds %= 3600;
      }
      if ( objUnits.min ) { intMinutes = Math.floor( totalSeconds / 60 ); }
      if ( objUnits.secs ) { intSeconds = Math.floor( totalSeconds % 60 ); }
      if ( debug ) {// Display integers figured out above
        const objIntegers = {
          intDecades: intDecades, intYears: intYears,
          intMonths: intMonths, intWeeks: intWeeks, intDays: intDays,
          intHours: intHours, intMinutes: intMinutes, intSeconds: intSeconds };
        console.warn( 'functions/duration.js integers: %o', objIntegers );
      }

      const result = [];
      if ( objUnits.xs && intDecades != 0 ) { result.push( intDecades + ' decade' + ( intDecades === 1 ? '' : 's' ) ); }
      if ( objUnits.yrs && intYears != 0 ) { result.push( intYears + ' year' + ( intYears === 1 ? '' : 's' ) ); }
      if ( objUnits.mos && intMonths != 0 ) { result.push( intMonths + ' month' + ( intMonths === 1 ? '' : 's' ) ); }
      if ( objUnits.wks && intWeeks != 0 ) { result.push( intWeeks + ' week' + ( intWeeks === 1 ? '' : 's' ) ); }
      if ( objUnits.days && intDays != 0 ) { result.push( intDays + ' day' + ( intDays === 1 ? '' : 's' ) ); }
      if ( objUnits.hrs && intHours != 0 ) { result.push( intHours + ' hour' + ( intHours === 1 ? '' : 's' ) ); }
      if ( objUnits.min && intMinutes != 0 ) { result.push( intMinutes + ' minute' + ( intMinutes === 1 ? '' : 's' ) ); }
      if ( objUnits.secs && intSeconds != 0 ) { result.push( intSeconds + ' second' + ( intSeconds === 1 ? '' : 's' ) ); }
      if ( debug ) { console.warn( 'functions/duration.js result array: %o', result ); }

      var strResult;
      switch ( result.length ) {
        case 0: strResult = ms + 'ms'; break;
        case 1: strResult = result[ 0 ]; break;
        case 2: strResult = result.join( ' and ' ); break;
        default:
          lastIncrement = result.pop();
          strResult = result.join( ', ' ) + ', and ' + lastIncrement;
      }
      return strResult;
    }
    else { return ms + 'ms'; }
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};