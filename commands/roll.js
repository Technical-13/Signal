module.exports = {
	name: "roll", // Command name
	description: "Dice Roller", // Set the description
	cooldown: 1000, // Set a cooldown of 1 second
	async run( interaction, client ) {
    const intSets = ( interaction.options.getInteger( 'sets' ) || 1 );
    const intDice = ( interaction.options.getInteger( 'dice' ) || 1 );
    const intSides = ( interaction.options.getInteger( 'sides' ) || 6 );
    const intMod = ( interaction.options.getInteger( 'modifier' ) || null );

//    var objSets = {};
    var intRollTotal = 0;
    var strRollTotal = ( intSets > 1 ? intSets + '#' : '' ) + ( intDice > 1 ? intDice : '' ) + 'd' + intSides + ( intMod != null ? ( intMod < 0 ? ' ' : ' +' ) + intMod : '' ) + ':';

    for ( var set = 1; set <= intSets; set++ ) {
//      var arrRolls = [];
      var intRollSubtotal = 0;
      var strRollSubtotal = '\n\t(';
      
      for ( var die = 1; die <= intDice; die++ ) {
        var result = Math.floor( Math.random() * intSides ) + 1;
        intRollSubtotal += result;      
        if ( die < intDice ) { strRollSubtotal += result + ') + ('; }
        else { strRollTotal += strRollSubtotal + result + ')'; }
//        arrRolls.push( result );
      }

      if ( intMod != null && intMod !== 0 ) {
        intRollSubtotal += intMod;
        strRollTotal += ( intMod < 0 ? ' ' : ' +' ) + intMod;
      }
      strRollTotal += ' = ' + intRollSubtotal;

      intRollTotal += intRollSubtotal;

//      objSets[ set ] = { rolls: arrRolls, mod: intMod, sum: intRollSubtotal };
    }

    if ( intSets > 1 ) {
      strRollTotal += '\nTotal: ' + intRollTotal;
    }

    interaction.reply( { content: strRollTotal } );
	}
}