let score = {
    upperSection: [
        { check: null, written: null },  // ones
        { check: null, written: null },  // twos
        { check: null, written: null },  // threes
        { check: null, written: null },  // fours
        { check: null, written: null },  // fives
        { check: null, written: null }   // sixes
    ],
    bonus: null,
    lowerSection: {
        pair: {check: null, written: null},
        twoPairs: {check: null, written: null},
        threeOfAKind: {check: null, written: null},
        fourOfAKind: {check: null, written: null},
        smallStraight: {check: null, written: null},
        bigStraight: {check: null, written: null},
        fullHouse: {check: null, written: null},
        chance: {check: null, written: null},
        jatsi: {check: null, written: null},
    },
    total: null,
    resetCheck() {
        for (const upperHand of this.upperSection) {
          upperHand.check = null;
        }
      
        for (const lowerHand of Object.values(this.lowerSection)) {
          lowerHand.check = null;
        }
    }
};

let dice = [
    [0], // number of times rolled
    [, false], // [face value, isLocked]
    [, false],
    [, false],
    [, false],
    [, false]
];

function lockDice(id) {
    const diceNum = id.slice(4, 5);
    if (dice[diceNum][1] == false) {
        dice[diceNum][1] = true;
        document.getElementById(id).style.color = 'blue'
    } else {
        dice[diceNum][1] = false;
        document.getElementById(id).style.color = ''
    }
}

function rollDice(dice) {
    score.resetCheck();
    // dice[0]++;
    if (dice[0] <= 3) {
        for (let i = 1; i <= 5; i++) {
            if  (dice[i][1] == false)
                dice[i][0] = 1 + Math.floor(Math.random() * 6);
            document.getElementById("dice" + i).innerHTML = dice[i][0];
        }
    }
    const diceCounts = countDieValues(dice);
    calculatePossibleScores(diceCounts);
}

function countDieValues(dice) {
    const faceValueCounts = {};
    
    // i=1 because the roll count is at dice[0]
    for (let i = 1; i <= 5; i++) {
        let roll = dice[i][0];
        
        faceValueCounts[roll] = (faceValueCounts[roll] || 0) + 1;
    }

    return faceValueCounts;
}

function calculatePossibleScores(faceValueCounts) {    
    
    let chance = 0;
    firstPair = null;
    
    for (let faceValue in faceValueCounts) {
        const currentCount = faceValueCounts[faceValue];
        const faceValueInt = parseInt(faceValue);       
        
        // chance
        chance += faceValueInt * currentCount;
        
        // upper section scores
        score.upperSection[faceValueInt - 1].check = faceValueInt * currentCount;
        
        // pair
        if (currentCount >= 2) {
            let thisPair = 2 * faceValueInt;

            // two pairs
            if (firstPair === null) {
                firstPair = thisPair;
            } else {
                score.lowerSection.twoPairs.check = firstPair + thisPair;
            }
            score.lowerSection.pair.check = thisPair;

            // three of a kind
            if (currentCount >= 3)
                score.lowerSection.threeOfAKind.check = 3 * faceValueInt;

            // four of a kind
            if (currentCount >= 4)
                score.lowerSection.fourOfAKind.check = 4 * faceValueInt;

            // jatsi - five of a kind
            if (currentCount === 5) {
                score.lowerSection.jatsi.check = 50;
            }
        }
    }
    score.lowerSection.chance.check = chance;
    
    // check straights
    if(Object.keys(faceValueCounts).length === 5) { // five unique values
        let diceString = Object.keys(faceValueCounts).join("");

        if (diceString === '12345')
            score.lowerSection.smallStraight.check = 15;
        else if (diceString === '23456')
            score.lowerSection.bigStraight.check = 20;
    }



    console.log(score);
}












/*
function checkSameNumbers(diceForCheck) {
    let upperHands = Object.keys(score.upperHands);
    for (let i = 0; i < diceForCheck.length; i++) {
        score.upperHands[upperHands[diceForCheck[i] - 1]].check += diceForCheck[i];
    }

    var j = 0;
    var k = 1;
    while (j <= 4) {
        while (diceForCheck[j] == diceForCheck[j + k]) {
            if (k == 1)
                score.lowerHands.pair.check = diceForCheck[j] * 2;
            if (k == 2)
                score.lowerHands.threeOfAKind.check = diceForCheck[j] * 3;
            if (k == 3)
                score.lowerHands.fourOfAKind.check = diceForCheck[j] * 4;
            if (k == 4)
                score.lowerHands.jatsi.check = 50;
            if (j + k == 5)
                break;
            k++;
        }
        k = 1;
        j++;
    }
}

function checkMore(diceForCheck) {
    diceForCheck.forEach(value => 
        score.lowerHands.random.check += value);
    
    let straight = [ 1, 2, 3, 4, 5, 6 ];
    let isStraight = true;

    if (diceForCheck[0] == straight[0]) {
        for (let i = 0; i < diceForCheck.length; i++) {      
            if (diceForCheck[i] != straight[i])
            isStraight = false;
        }
        if (isStraight == true)
            score.lowerHands.smallStraight.check = 15;
    }
    
    if (diceForCheck[0] == straight[1]) {
        for (let i = 0; i < diceForCheck.length; i++) {      
            if (diceForCheck[i] != straight[i + 1])
            isStraight = false;
        }
        if (isStraight == true)
            score.lowerHands.bigStraight.check = 20;
    }

    if ((diceForCheck[0] == diceForCheck[1] && diceForCheck[2] == diceForCheck[3] && diceForCheck[3] == diceForCheck[4] 
        && diceForCheck[1] != diceForCheck[2])
        || (diceForCheck[0] == diceForCheck[1] && diceForCheck[1] == diceForCheck[2] && diceForCheck[3] == diceForCheck[4] 
        && diceForCheck[2] != diceForCheck[3])) {
            diceForCheck.forEach(value => 
                score.lowerHands.fullHouse.check += value);
        }
}

*/

 // document.getElementById(numbers[diceForCheck[i][0] - 1]).innerHTML = score[numbers[diceForCheck[i][0] - 1]].check;
