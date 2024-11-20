const optionSelector = document.getElementById( 'option-selector-input' );
const clearButton = document.getElementById( 'clear-button' );
const goButton = document.getElementById( 'go-button' );

function fetchOptions( type, query ) {
  const request = new Request( 'http://node4.lunes.host:2287/api/' + type + '/' + query );
  return fetch( request ).then( ( response ) => {
    if ( response.status === 200 ) { return response.json(); }
    else { throw new Error( 'Something went wrong on API server: ' + response.status ); }
  } )
  .then( ( response ) => { return response; } )
  .catch( ( error ) => { console.error( 'Error: %o', error ); } );
}

async function handleInput() {
  if ( optionSelector.value ) {
    clearButton.disabled = false;
    goButton.disabled = false;
    const page = location.pathname.toLocaleLowerCase().split( '/' ).filter( x => x ).pop();
    const searchGroup = page.substr( 0, page.length - 1 );
    const qType = ( searchGroup === 'guild' ? 'g' : 'u' );
    const newOptions = await fetchOptions( qType, optionSelector.value );
    const newOptionDOM = [];
    for ( let dbOptionKey in newOptions ) {
      let newOption = document.createElement( 'option' );
      newOption.data = dbOptionKey;
      newOption.innerText = newOptions[ dbOptionKey ];
      newOptionDOM.push( newOption );
    }
    document.getElementById( searchGroup + '-selector' ).replaceChildren( ...newOptionDOM );
  }
  else {
    clearButton.disabled = true;
    goButton.disabled = true;
  }
}

function handleGo() {
  let addSlash = ( location.href.charAt( location.href.length - 1 ) != '/' ? '/' : '' );
  let optionId = Array.from( document.querySelectorAll( 'option' ) ).find( opt => opt.value === optionSelector.value ).data;
  location.href += addSlash + optionId;
}

function handleClear() {
  optionSelector.value = '';
  clearButton.disabled = true;
  goButton.disabled = true;
  goButton.onclick = null;
}

optionSelector.addEventListener( 'input', handleInput );
goButton.addEventListener( 'click', handleGo );
goButton.addEventListener( 'touchstart', handleGo );
clearButton.addEventListener( 'click', handleClear );
clearButton.addEventListener( 'touchstart', handleClear );