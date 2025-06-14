const { ApplicationCommandType, InteractionContextType } = require( 'discord.js' );
const chalk = require( 'chalk' );
const userPerms = require( '../../functions/getPerms.js' );
const getI18n = require( '../../functions/getInternationalizations.js' );
const modData = { group: 'fun', name: 'roll', type: 'slashCommands' };
const l10n = getI18n( modData );
const strScript = chalk.hex( '#FFA500' ).bold( './' + modData.type + '/' + modData.group + '/' + modData.name + '.js' );

module.exports = {
  group: modData.group,
  name: modData.name,
  name_localizations: l10n.name,
  description: 'Dice Roller (default: 1#1d6±0)',
  description_localizations: l10n.description,
  options: [
    { type: 4, name: 'dice', name_localizations: l10n.dice.name,
      description: 'How many dice? (default: 1)',
      description_localizations: l10n.dice.description
    },
    { type: 4, name: 'sides', name_localizations: l10n.sides.name,
      description: 'How many sides per die? (default: 6)',
      description_localizations: l10n.sides.description
    },
    { type: 4, name: 'sets', name_localizations: l10n.sets.name,
      description: 'How many sets of dice? (default: 1)',
      description_localizations: l10n.sets.description
    },
    { type: 4, name: 'modifier', name_localizations: l10n.modifier.name,
      description: '± to final roll for each die? (default: 0)',
      description_localizations: l10n.modifier.description
    }
  ],
  type: ApplicationCommandType.ChatInput,
  contexts: [ InteractionContextType.BotDM, InteractionContextType.Guild ],
  cooldown: 1000, // Set a cooldown of 1 second
  run: async ( client, interaction ) => {
    const r6e = getI18n( modData, { interaction: interaction } ).responses;
    try {
      const { guild, locale, options, user: author } = interaction;
      const useLang = ( locale ?? 'en-US' );
      const { content } = await userPerms( author, guild );
      if ( content ) { return interaction.editReply( { content: content } ); }

      const intSets = ( options.get( 'sets' ) ? ( options.get( 'sets' ).value || 1 ) : 1 );
      const intDice = ( options.get( 'dice' ) ? ( options.get( 'dice' ).value || 1 ) : 1 );
      const intSides = ( options.get( 'sides' ) ? ( options.get( 'sides' ).value || 6 ) : 6 );
      const intMod = ( options.get( 'modifier' ) ? ( options.get( 'modifier' ).value || null ) : null );

      var intRollTotal = 0;
      var strRollTotal = ( intSets > 1 ? intSets + '#' : '' ) + ( intDice > 1 ? intDice : '' ) + 'd' + intSides + ( intMod != null ? ( intMod < 0 ? ' ' : ' +' ) + intMod : '' ) + ':';

      for ( var set = 1; set <= intSets; set++ ) {
        //    var arrRolls = [];
        var intRollSubtotal = 0;
        var strRollSubtotal = '\n\t(';

        for ( var die = 1; die <= intDice; die++ ) {
          var result = Math.floor( Math.random() * intSides ) + 1;
          intRollSubtotal += result;
          if ( die < intDice ) { strRollSubtotal += result + ') + ('; }
          else { strRollTotal += strRollSubtotal + result + ')'; }
          //    arrRolls.push( result );
        }

        if ( intMod != null && intMod !== 0 ) {
          intRollSubtotal += intMod;
          strRollTotal += ( intMod < 0 ? ' ' : ' +' ) + intMod;
        }
        strRollTotal += ' = ' + intRollSubtotal;

        intRollTotal += intRollSubtotal;

        //    objSets[ set ] = { rolls: arrRolls, mod: intMod, sum: intRollSubtotal };
      }

      if ( intSets > 1 ) {
        strRollTotal += '\nTotal: ' + intRollTotal;
      }

      interaction.reply( { content: strRollTotal } );
    }
    catch ( errObject ) { console.error( 'Uncaught error in %s:\n\t%s', strScript, errObject.stack ); }
  }
}