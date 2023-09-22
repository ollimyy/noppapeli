let score = {
    upperSection: [
        { possible: null, written: null },  // ones
        { possible: null, written: null },  // twos
        { possible: null, written: null },  // threes
        { possible: null, written: null },  // fours
        { possible: null, written: null },  // fives
        { possible: null, written: null }   // sixes
    ],
    upperSectionTotal: null,
    bonus: null,
    lowerSection: {
        pair: {possible: null, written: null},
        twoPairs: {possible: null, written: null},
        threeOfAKind: {possible: null, written: null},
        fourOfAKind: {possible: null, written: null},
        smallStraight: {possible: null, written: null},
        bigStraight: {possible: null, written: null},
        fullHouse: {possible: null, written: null},
        chance: {possible: null, written: null},
        jatsi: {possible: null, written: null},
    },
    total: null,
    resetPossibles() {
        for (const combination of this.upperSection) {
          combination.possible = null;
        }
      
        for (const combination of Object.values(this.lowerSection)) {
          combination.possible = null;
        }
    }
};

function showPossibleScores(score) {
    const upperIds = ["ones", "twos", "threes", "fours", "fives", "sixes"];

    for (let i = 0; i < 6; i++) {
        const possibleScore = score.upperSection[i].possible;
        document.getElementById(upperIds[i]).innerText = possibleScore;
    }
    
    for (const combination in score.lowerSection) {
            const possibleScore = score.lowerSection[combination].possible;
            document.getElementById(combination).innerText = possibleScore;
    }
}

let dice = [
    [3], // number of rolls left this turn
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
    score.resetPossibles();

    if (dice[0] > 0) {
        for (let i = 1; i <= 5; i++) {
            if  (dice[i][1] == false)
            dice[i][0] = 1 + Math.floor(Math.random() * 6);
        document.getElementById("dice" + i).innerHTML = dice[i][0];
        }
        dice[0]--;
        document.getElementById("rollsLeft").innerText = dice[0];
    }


    const faceValueCounts = countFaceValues(dice);
    calculatePossibleScores(faceValueCounts);
    showPossibleScores(score);
}

function countFaceValues(dice) {
    const faceValueCounts = {};
    
    // i=1 because the roll count is at dice[0]
    for (let i = 1; i <= 5; i++) {
        let roll = dice[i][0];
        
        faceValueCounts[roll] = (faceValueCounts[roll] || 0) + 1;
    }

    return faceValueCounts;
}

function calculatePossibleScores(faceValueCounts) {    
    
    let sum = 0;
    let firstPair = null;
    let fullHouse = false;
    
    for (let faceValue in faceValueCounts) {
        const currentCount = faceValueCounts[faceValue];
        const faceValueInt = parseInt(faceValue);   
        
        sum += faceValueInt * currentCount;
        
        // upper section scores
        score.upperSection[faceValueInt - 1].possible = faceValueInt * currentCount;
        
        // pair
        if (currentCount >= 2) {
            let thisPair = 2 * faceValueInt;

            // two pairs
            if (firstPair === null) {
                firstPair = thisPair;
            } else {
                score.lowerSection.twoPairs.possible = firstPair + thisPair;
            }
            score.lowerSection.pair.possible = thisPair;

            // three of a kind
            if (currentCount >= 3)
                score.lowerSection.threeOfAKind.possible= 3 * faceValueInt;

            // four of a kind
            if (currentCount >= 4)
                score.lowerSection.fourOfAKind.possible = 4 * faceValueInt;

            // jatsi - five of a kind
            if (currentCount === 5) {
                score.lowerSection.jatsi.possible = 50;
            }
        }

        // full house
        if (Object.keys(faceValueCounts).length === 2 && (currentCount === 3 || currentCount === 2)) {
            fullHouse = true;
        }
    }

    // chance
    score.lowerSection.chance.possible = sum;

    if(fullHouse)
        score.lowerSection.fullHouse.possible = sum;
    
    // check straights
    if(Object.keys(faceValueCounts).length === 5) { // five unique values
        let diceString = Object.keys(faceValueCounts).join("");

        if (diceString === '12345')
            score.lowerSection.smallStraight.possible = 15;
        else if (diceString === '23456')
            score.lowerSection.bigStraight.possible = 20;
    }

    console.log(score); // remove when possibilities shown in ui
}