module.exports = {
	name: "bot",
	description: "Options to find the GitHub repository, report bugs, and suggest features!",
	cooldown: 3000,
	async run( interaction, client ) {
		const strAction = ( interaction.options.getString( 'action' ) ?? 'link' );
    var strTitle = ( interaction.options.getString( 'title' ) ?? '' );
    if ( strTitle ) { strTitle = '&title=' + strTitle; }
		switch ( strAction ) {
			case 'sponsor':
  			interaction.reply( { content: 'Sponsor me from GitHub:\n:link: <https://github.com/sponsors/Technical-13>' } );
  			break;
			case 'bug': 
  			interaction.reply( { content: 'Report a bug on GitHub:\n:link: <https://github.com/Technical-13/Signal/issues/new?labels=bug&template=bug_report.md' + strTitle + '>' } );
  			break;
			case 'feature':
  			interaction.reply( { content: 'Request a feature on GitHub:\n:link: <https://github.com/Technical-13/Signal/issues/new?labels=enhancement&template=feature_request.md' + strTitle + '>' } );
  			break;
			case 'link' : default :
		  	interaction.reply( { content: 'You can check me out on GitHub:\n:link: <https://github.com/Technical-13/Signal/tree/master>' } );
		}
	}
}
