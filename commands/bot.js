module.exports = {
	name: "bot",
	description: "Options to find the GitHub repository, report bugs, and suggest features!",
	cooldown: 3000,
	async run( interaction, client ) {
		const strAction = ( interaction.options.getString( 'action' ) ?? 'link' );
    switch ( strAction ) {
      case 'link' : default :
        interaction.reply( { content: 'You can check me out on GitHub: :link:\nhttps://github.com/Technical-13/Signal/tree/master' } );
    }
    // https://github.com/sponsors/Technical-13
    // https://github.com/Technical-13/Signal/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=
    // https://github.com/Technical-13/Signal/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title=
	}
}
