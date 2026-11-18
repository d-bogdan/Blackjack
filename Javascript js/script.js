// Placeholder, will modify the logic later


let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0; 

let hidden;
let deck;

let canHit = false; //allows the player (you) to draw while yourSum <= 21

let currentBet = 0;
let playerBalance = 1000;

window.onload = function() {
    buildDeck();
    shuffleDeck();
    setupBettingSystem();
    startGame();
}

// ---------------------------------------------------------------------------
// Deck / shoe
// The game is played with a shoe of NUM_DECKS standard 52-card decks
// (3 x 52 = 156 cards). Cards are strings in the "VALUE-SUIT" format
// (e.g. "A-S", "10-H") so they match the file names in ./images/.
// ---------------------------------------------------------------------------

const NUM_DECKS = 3;
const CARD_VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const CARD_SUITS = ["C", "D", "H", "S"]; // Clubs, Diamonds, Hearts, Spades

// When fewer than this many cards are left, the shoe is rebuilt and reshuffled
// (roughly 25% of the shoe, like the "cut card" in a real casino).
const RESHUFFLE_THRESHOLD = Math.floor(NUM_DECKS * 52 * 0.25);

// Fills the global `deck` with NUM_DECKS full decks, in order (not shuffled).
function buildDeck() {
    deck = [];

    for (let d = 0; d < NUM_DECKS; d++) {
        for (let i = 0; i < CARD_SUITS.length; i++) {
            for (let j = 0; j < CARD_VALUES.length; j++) {
                deck.push(CARD_VALUES[j] + "-" + CARD_SUITS[i]); // A-C -> K-C, A-D -> K-D, ...
            }
        }
    }
}

// Shuffles the global `deck` in place using the Fisher-Yates algorithm,
// which gives every possible ordering the same probability.
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index in [0, i]
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}

// Takes the top card from the shoe. If the shoe is running low it is rebuilt
// and reshuffled first, so the game never runs out of cards.
// Can be used instead of deck.pop() in the game logic.
function drawCard() {
    if (deck.length <= RESHUFFLE_THRESHOLD) {
        buildDeck();
        shuffleDeck();
    }
    return deck.pop();
}

function startGame() {
    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);
    // console.log(hidden);
    // console.log(dealerSum);
    while (dealerSum < 17) {
        //<img src="./cards/4-C.png">
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }
    console.log(dealerSum);

    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    console.log(yourSum);
    document.getElementById("hit").addEventListener("click", hit);
    document.getElementById("stay").addEventListener("click", stay);

}

function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) { //A, J, 8 -> 1 + 10 + 8
        canHit = false;
    }

}

function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    let message = "";
    if (yourSum > 21) {
        message = "You Lose!";
    }
    else if (dealerSum > 21) {
        message = "You win!";
    }
    //both you and dealer <= 21
    else if (yourSum == dealerSum) {
        message = "Tie!";
    }
    else if (yourSum > dealerSum) {
        message = "You Win!";
    }
    else if (yourSum < dealerSum) {
        message = "You Lose!";
    }

    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    document.getElementById("results").innerText = message;
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}