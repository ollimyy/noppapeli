const upperIds = ["ones", "twos", "threes", "fours", "fives", "sixes"];

let scoresheet = {
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
        pair: { possible: null, written: null },
        twoPairs: { possible: null, written: null },
        threeOfAKind: { possible: null, written: null },
        fourOfAKind: { possible: null, written: null },
        smallStraight: { possible: null, written: null },
        bigStraight: { possible: null, written: null },
        fullHouse: { possible: null, written: null },
        chance: { possible: null, written: null },
        jatsi: { possible: null, written: null },
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

function resetDice() {
    const dice = [
        3, // number of rolls left
        [ null , false], // [face value, isLocked]
        [ null, false],
        [ null, false],
        [ null, false],
        [ null, false]
    ];

    for(let i = 1; i < 6; i++){
        document.getElementById("die" + i).classList.remove("locked");
        document.getElementById("die" + i).innerText = "";
    }

    document.getElementById("roll").style.display = "inline-block";
    document.getElementById("rollsLeft").innerText = dice[0];



    return dice;
}

let dice = resetDice();

function updateScoreCell(scoreCell, possibleScore) {

        scoreCell.innerText = possibleScore !== null ? possibleScore : "-";
        scoreCell.classList.toggle("possible-score", possibleScore !== null);
        scoreCell.classList.toggle("no-possible-score", possibleScore === null);

        // https://stackoverflow.com/questions/11455515/how-to-check-whether-dynamically-attached-event-listener-exists-or-not
        if(!scoreCell.getAttribute("listener")) {
            scoreCell.setAttribute("listener", true)
            // https://stackoverflow.com/questions/4950115/removeeventlistener-on-anonymous-functions-in-javascript
            scoreCell.addEventListener("click", function eventHandler() {
                handleEndTurn(scoreCell);
                this.removeEventListener("click", eventHandler);
            });
        }
}

function updateScoresheetUI(scoresheet) {
    for (let i = 0; i < 6; i++) {

        const possibleScore = scoresheet.upperSection[i].possible;
        const scoreCell = document.getElementById(upperIds[i]);

        if(scoresheet.upperSection[i].written === null) {
            updateScoreCell(scoreCell, possibleScore);
        }
    }

    for (const combination in scoresheet.lowerSection) {
        const possibleScore = scoresheet.lowerSection[combination].possible;
        const scoreCell = document.getElementById(combination)

        if(scoresheet.lowerSection[combination].written === null) {
            updateScoreCell(scoreCell, possibleScore);
        }
    }
}

function lockDice(id) {
    const diceIndex = id.slice(3, 4);
    // prevent locking dice before first roll and after last
    if (dice[diceIndex][0] === null || dice[0] === 0) {
        return;
    }

    // toggle locked state
    const isLocked = dice[diceIndex][1];
    dice[diceIndex][1] = !isLocked;
    document.getElementById(id).classList.toggle("locked", !isLocked);
}

function rollDice(dice) {
    scoresheet.resetPossibles();

    if (dice[0] > 0) {
        for (let i = 1; i <= 5; i++) {
            if (dice[i][1] == false)
                dice[i][0] = 1 + Math.floor(Math.random() * 6);
            document.getElementById("die" + i).innerText = dice[i][0];
        }
        dice[0]--;
        document.getElementById("rollsLeft").innerText = dice[0];
    } 

    if(dice[0] === 0) {
        document.getElementById("roll").style.display = "none";
    }


    const faceValueCounts = countFaceValues(dice);
    calculatePossibleScores(faceValueCounts);
    updateScoresheetUI(scoresheet);
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
        scoresheet.upperSection[faceValueInt - 1].possible = faceValueInt * currentCount;

        // pair
        if (currentCount >= 2) {
            let thisPair = 2 * faceValueInt;

            // two pairs
            if (firstPair === null) {
                firstPair = thisPair;
            } else {
                scoresheet.lowerSection.twoPairs.possible = firstPair + thisPair;
            }
            scoresheet.lowerSection.pair.possible = thisPair;

            // three of a kind
            if (currentCount >= 3)
                scoresheet.lowerSection.threeOfAKind.possible = 3 * faceValueInt;

            // four of a kind
            if (currentCount >= 4)
                scoresheet.lowerSection.fourOfAKind.possible = 4 * faceValueInt;

            // jatsi - five of a kind
            if (currentCount === 5) {
                scoresheet.lowerSection.jatsi.possible = 50;
            }
        }

        // full house
        if (Object.keys(faceValueCounts).length === 2 && (currentCount === 3 || currentCount === 2)) {
            fullHouse = true;
        }
    }

    // chance
    scoresheet.lowerSection.chance.possible = sum;

    if (fullHouse)
        scoresheet.lowerSection.fullHouse.possible = sum;

    // check straights
    if (Object.keys(faceValueCounts).length === 5) { // five unique values
        let diceString = Object.keys(faceValueCounts).join("");

        if (diceString === '12345')
            scoresheet.lowerSection.smallStraight.possible = 15;
        else if (diceString === '23456')
            scoresheet.lowerSection.bigStraight.possible = 20;
    }
}

function removePossibleStylesFromStyleCell(scoreCell) {
    scoreCell.classList.remove("possible-score");
    scoreCell.classList.remove("no-possible-score");
}

function removePossiblesFromUI() {
    for (let i = 0; i < 6; i++) {
        const scoreCell = document.getElementById(upperIds[i]);

        removePossibleStylesFromStyleCell(scoreCell);

        if(scoresheet.upperSection[i].written === null) {
            scoreCell.innerText = "";
        }
    }

    for (const combination in scoresheet.lowerSection) {
        const scoreCell = document.getElementById(combination)

        removePossibleStylesFromStyleCell(scoreCell);

        if(scoresheet.lowerSection[combination].written === null) {
            scoreCell.innerText = "";
        }
    }
}

function handleEndTurn(scoreCell) {
    const id = scoreCell.id;
    const scoreString = scoreCell.innerText;
    // - is used in the ui but 0 in the scoresheet calculations
    const score = (scoreString === "-") ? 0 : parseInt(scoreString);

    // write score to upper section
    if (upperIds.includes(id)) {
        scoresheet.upperSection[upperIds.indexOf(id)].written = score;
        scoresheet.upperSectionTotal += score;
        document.getElementById("upperSectionTotal").innerText = scoresheet.upperSectionTotal;

        // award bonus
        if(scoresheet.upperSectionTotal >= 63) {
            scoresheet.bonus = 50;
            document.getElementById("bonus").innerText = 50;
        }

    // write score to lower section
    } else {
        scoresheet.lowerSection[id].written = score;
    }

    scoresheet.total += score;
    document.getElementById("total").innerText = scoresheet.total;

    scoresheet.resetPossibles();
    removePossiblesFromUI();
    dice = resetDice();
   
}
