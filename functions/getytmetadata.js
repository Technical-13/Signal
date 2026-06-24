const client = require( '..' );
const { EmbedBuilder } = require( 'discord.js' );
const axios = require( 'axios' );
const chalk = require( 'chalk' );
const strScript = chalk.hex( '#FFA500' ).bold( './functions/getytmetadata.js' );

/**
 * Checks a message for YouTube links and posts an embed if Discord fails to.
 * @param {Message} message - The Discord.js message object
 */
module.exports = async ( message ) => {
  try {
    if ( message.author.bot ) { return; }

    const ytClipRegex = /youtube\.com\/clip\/([a-zA-Z0-9_-]{32,36})/gi;
    const ytPlaylistRegex = /youtube\.com\/\S*[\?&]list=(OLAK5uy_[a-zA-Z0-9_-]{36}|[a-zA-Z0-9_-]{34}|[a-zA-Z0-9_-]{13,18})/gi;
    const ytShortRegex = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/gi;
    const ytVideoRegex = /youtu(?:be\.com|\.be)\/(?!(?:clip|shorts)\/|(?:playlist|watch)[\?&]list=)[^\s&]*(?:[\?&]v=)?([a-zA-Z0-9_-]{11})/gi;

    const cleanContent = message.content.replace( /[<>]/g, '' );
    const allClips = [ ...cleanContent.matchAll( ytClipRegex ) ];
    const allPlaylists = [ ...cleanContent.matchAll( ytPlaylistRegex ) ];
    const allShorts = [ ...cleanContent.matchAll( ytShortRegex ) ];
    const allVideos = [ ...cleanContent.matchAll( ytVideoRegex ) ];
    if ( allClips.length + allPlaylists.length + allShorts.length + allVideos.length === 0 ) { return; }
    const strMetadataResponse = 'Please stand by, YouTube link' + ( allVideos.length + allPlaylists.length ? 's' : '' ) + ' detected.';
    const metadataResponse = await message.reply( strMetadataResponse );
    strMetadataResponse += '\nProcessing event.';

    let waitForDiscordEmbed = 3;
    while ( waitForDiscordEmbed > 0 ) {
      await new Promise( resolve => setTimeout( resolve, 1000 ) );
      strMetadataResponse += '.';
      await metadataResponse.edit( strMetadataResponse );

      const fetchedMessage = await message.channel.messages.fetch( message.id ).catch( () => null );
      if ( !fetchedMessage ) {
        strMetadataResponse += '\nAborting process. Original post was deleted.';
        await metadataResponse.edit( strMetadataResponse );
        await new Promise( resolve => setTimeout( resolve, 3000 ) );
        await metadataResponse.delete();
        return;
      }

      const hasYouTubeEmbed = fetchedMessage.embeds.some( embed => embed.provider && embed.provider.name === 'YouTube' );
      if ( hasYouTubeEmbed ) {
        strMetadataResponse += '\nAborting process. YouTube metadata already posted.';
        await metadataResponse.edit( strMetadataResponse );
        await new Promise( resolve => setTimeout( resolve, 3000 ) );
        await metadataResponse.delete();
        return;
      }

      waitForDiscordEmbed--;
    }
    strMetadataResponse += '\nFetching YouTube metadata...';

    const getTargetURL = ( id, type ) => {
      const baseTargetURL = 'https://www.youtube.com/';
      if ( !id ) { return; }
      switch ( type ) {
        case 'Clip' : return baseTargetURL + 'clip/' + id;
        case 'Playlist' : return baseTargetURL + 'playlist?list=' + id;
        case 'Short' :
        case 'Video' :
        default : return baseTargetURL + 'watch?v=' + id;
      }
    };
    const tasks = [].concat(
      allClips.map( m => ( { id: m[ 1 ], index: m.index, type: 'Clip', url: getTargetURL( m[ 1 ], 'Clip' ) } ) ),
      allPlaylists.map( m => ( { id: m[ 1 ], index: m.index, type: 'Playlist', url: getTargetURL( m[ 1 ], 'Playlist' ) } ) ),
      allShorts.map( m => ( { id: m[ 1 ], index: m.index, type: 'Short', url: getTargetURL( m[ 1 ], 'Short' ) } ) ),
      allVideos.map( m => ( { id: m[ 1 ], index: m.index, type: 'Video', url: getTargetURL( m[ 1 ], 'Video' ) } ) )
    );
    tasks.sort( ( a, b ) => a.index - b.index );

    const processingTasks = tasks
      .filter( ( item, idx, self ) => self.findIndex( t => t.url === item.url ) === idx )
      .slice( 0, 20 );
    const resolvedItems = [];
    await Promise.all( processingTasks.map( async ( task ) => {
      if ( !task.url ) {
        resolvedItems.push( {
          author: { name: '🤖 Unknown Creator 🤖' },
          title: '🚨 Error: Missing ' + task.type + ' ID 🚨',
          type: task.type,
          valid: false
        } );
      }
      else {
        try {
          const response = await axios.get( 'https://www.youtube.com/oembed', {
            params: { url: task.url, format: 'json' },
            timeout: 5000
          } );
          const resData = response.data;
          resolvedItems.push( {
            author: {
              name: resData.author_name || 'YouTube Creator',
              url: ( resData.author_url?.startsWith( 'http' ) ? '' : 'https://www.youtube.com' ) + resData.author_url
            },
            title: resData.title || 'YouTube ' + task.type,
            thumb: resData.thumbnail_url,
            type: task.type,
            url: task.url,
            valid: true
          } );
        } catch ( errFetch ) {
          resolvedItems.push( {
            author: { name: '🚨 Private Creator 🚨' },
            title: '🚨 Private / Unavailable ' + task.type + ' 🚨',
            type: task.type,
            url: task.url,
            valid: false
          } );
          console.error( 'Failed to fetch YouTube metadata for %s with ID %s:', task.type, task.id, errFetch.message );
        }
      }
    } ) );

    const iconYT = 'https://www.gstatic.com/marketing-cms/assets/images/98/c6/59f93f6f4ac1a8e63612c5370193/favicon-1.png=s20'
    const embed = new EmbedBuilder().setColor( '#FF0000' );

    const assetTypes = { Clip: 0, Playlist: 0, Short: 0, Video: 0 };
    const getAssetCount = ( assetTypes ) => {
      let assetTypeString = '';
      const textParts = Object.entries( assetTypes ).filter( item => item[ 1 ] > 0 ).map( item => {
        const assetType = item[ 0 ].toLowerCase(), assetValue = item[ 1 ];
        return assetValue === 1 ? 'a ' + assetType : assetValue + ' ' + assetType + 's';
      } );
      if ( textParts.length === 1 ) { assetTypeString = textParts[ 0 ]; }
      else if ( textParts.length === 2 ) { assetTypeString = textParts.join( ' and ' ); }
      else {
        const lastPart = textParts.pop();
        assetTypeString = textParts.join( ', ' );
        assetTypeString += ', and ' + lastPart;
      }

      return assetTypeString.charAt( 0 ).toUpperCase() + assetTypeString.slice( 1 );
    }

    if ( !resolvedItems.length ) {
      strMetadataResponse += '\nAborting process. Failed to fetch any metadata.';
      await metadataResponse.edit( strMetadataResponse );
      await new Promise( resolve => setTimeout( resolve, 3000 ) );
      await metadataResponse.delete();
      return;
    }
    else if ( resolvedItems.length === 1 ) {
      const item = resolvedItems[ 0 ];
      embed.setTitle( item.title || '🤖🚨 Missing Title Detected 🚨🤖' )
      .setFooter( {
        text: item.type + ( !item.valid ? ' • 🚨 Error Fetching Metadata 🚨' : '' ),
        iconURL: iconYT
      } );
      if ( item.author.url ) { embed.setAuthor( { name: item.author.name, url: item.author.url } ); }
      else { embed.setAuthor( { name: item.author.name } ); }
      if ( item.thumb ) { embed.setImage( item.thumb ); }
      if ( item.url ) { embed.setURL( item.url ); }
    }
    else if ( resolvedItems.length <= 3 ) {
      let desc = '';
      resolvedItems.forEach( ( item, ndx ) => {
        assetTypes[ item.type ] += 1;
        const itemAuthor = item.author.url ? '[' + item.author.name + '](' + item.author.url + ')' : '*__' + item.author.name + '__*';
        const itemTitle = ( !item.title ? '🤖🚨 Missing Title Detected 🚨🤖' : ( item.url ? '[' + item.title + '](' + item.url + ')' : '*__' + item.title + '__*' ) );
        desc += '• ' + itemTitle + ' by ' + itemAuthor + ( ndx !== resolvedItems.length - 1 ? '\n' : '' );
      } );
      embed.setDescription( desc.trim() )
      .setFooter( {
        text: getAssetCount( assetTypes ),
        iconURL: iconYT
      } );
    }
    else {
      resolvedItems.forEach( item => {
        assetTypes[ item.type ] += 1;
        const itemAuthor = item.author.url ? '[' + item.author.name + '](' + item.author.url + ')' : '*__' + item.author.name + '__*';
        const itemTitle = item.url ? '[Watch Content](' + item.url + ')' : '';
        embed.addFields( {
          name: item.title,
          value: 'By ' + itemAuthor + '\n' + itemTitle,
          inline: true
        } );
      } );
      embed.setDescription( 'Multiple YouTube links detected. Details listed below:' )
      .setFooter( {
        text: getAssetCount( assetTypes ),
        iconURL: iconYT
      } );
    }

    await metadataResponse.edit( { content: '', embeds: [embed] } );
  }
  catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
};
