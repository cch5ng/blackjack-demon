//TESTING
// reorderPlayerCards(['ca', 'c9', 'sj']);
// reorderPlayerCards(['ca', 'c9', 'da', 'sj']);
// reorderPlayerCards(['sa', 'ha', 'ca', 'c9', 'da', 'sj']);

// playerGetHandValue(['ca', 'sj']); //21
// playerGetHandValue(['ca', 'sj', 'c9']); //20
// playerGetHandValue(['ca', 'ha', 'sj', 'c9']); //21
// playerGetHandValue(['ca', 'ha', 'sj', 'c9', 'd3']); //24
// playerGetHandValue(['ca', 'ha', 'da', 'sa', 'c9']); //13

// console.log(doPlayerCardsContainAce(['ca', 'ha', 'sj', 'c9'])); //true
// console.log(doPlayerCardsContainAce(['sj', 'c9'])); //false
// console.log(doPlayerCardsContainAce(['sj', 'c9', 'ca'])); //true

// reorderPlayerCards(['ca', 'ha', 'sj', 'c9']); // {reorderedCards: ['sj', 'c9', 'ca', 'ha'], numberAces: 2}
// reorderPlayerCards(['da', 'ca', 'ha', 'sj', 'c9']); // {reorderedCards: ['sj', 'c9', 'da', 'ca', 'ha'], numberAces: 3}
// console.log(reorderPlayerCards(['c5', 'c9',  'd2'])); // {reorderedCards: ['c5', 'c9',  'd2'], numberAces: 0}

// console.log(isPlayerBust(['c3', 'sk', 'hq'])); //true passing
// console.log(isPlayerBust(['ca', 'sj'])); //false passing
// console.log(isPlayerBust(['ca', 'sj', 'c9'])); //false passing
// console.log(isPlayerBust(['ca', 'ha', 'sj', 'c9', 'd3'])); //true passing
// console.log(isPlayerBust(['ca', 'ha', 'sj', 'c9'])); //false passing
// console.log(isPlayerBust(['ca', 'ha', 'da', 'sa', 'c9'])); //false passing

//TEST evaluteWinnerUser

//TEST resetGame