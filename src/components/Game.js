import {useEffect, useState} from 'react';

//constants
const SHAPES = ['d', 'h', 'c', 's'];
const VALUES = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
const valueToNum = {j: 10, q: 10, k: 10};
const acesCountToPossibleValuesMap = new Map();
acesCountToPossibleValuesMap.set(1, [11, 1]);
acesCountToPossibleValuesMap.set(2, [12, 2]);
acesCountToPossibleValuesMap.set(3, [13, 3]);
acesCountToPossibleValuesMap.set(4, [14, 4]);
const players = ['p','d']; //max players 5 including d; min players 2 including d

const Game = ({isGamePaused}) => {

//vars game state
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState({d: [], p: []});
    //key is player id and value is array of their current cards; dealer is 'd'
    //2nd card of dealer should be hidden on client side
  const [playerCardTotals, setPlayerCardTotals] = useState({d: 0, p: 0});
    //determine winner/loser
  const [finishedPlayers, setFinishedPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState(-1) 
    //possible values -1 not started, 0 started in play, 1 player turn, 2 dealer turn, 3 game over
  // let countDownToGameStart = 30000; //ms units
  // let countDownForCurrentTurn = 60000
  //let waitingOnPlayer = true;
  const [isDealerCardHidden, setIsDealerCardHidden] = useState(true);

  console.log('gameStatus', gameStatus);
  console.log('shuffledDeck', shuffledDeck);

  const startGameClick = () => {
    if (gameStatus === -1) {
      setGameStatus(0);
    }
  }

  //create a deck (ordered)
  const createDeck = () => {
    let newDeck = [];
    SHAPES.forEach(s => {
      VALUES.forEach(v => {
        let card = `${s}${v}`;
        newDeck.push(card);
      })
    })
    console.log('newDeck', newDeck);
    return newDeck;
  }

  //shuffle a deck
  const shuffleDeck = (deck) => {
    const shuffledDeck = [];
    const copyDeck = deck.slice(0);

    while (copyDeck.length) {
      //remove a random card and add to the end of shuffedDeck
      let curLen = copyDeck.length;
      let randIdx = Math.floor(Math.random() * curLen);
      let removedCard = copyDeck.splice(randIdx, 1);
      shuffledDeck.push(removedCard[0]);
    }
    //replace deck with copyDeck
    console.log('shuffledDeck', shuffledDeck);
    return shuffledDeck;
  }

  //array of card strings
  const doPlayerCardsContainAce = (cards) => {
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].indexOf('a') > -1) {
        return true;
      }
    } 
    return false;
  }

  const reorderPlayerCards = (cards) => {
    if (!doPlayerCardsContainAce(cards)) {
      return {reorderedCards: cards, numberAces: 0};
    }
    let reorderedCards = [];
    let numberAces = 0;
    cards.forEach(card => {
      if (card[card.length - 1] === 'a') {
        reorderedCards.push(card);
        numberAces += 1;
      } else {
        reorderedCards.unshift(card);
      }
    })

    console.log('reorderedCards', reorderedCards)
    console.log('numberAces', numberAces)
    return {reorderedCards, numberAces};
  }

  //deal cards to the dealer
    //shuffledDeck has to have cards
    //dealer responses are automated; this is probably the most complex logic
  /*
  When the dealer has served every player, the dealers face-down card is turned up. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand. If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21), the dealer must count the ace as 11 and stand. The dealer's decisions, then, are automatic on all plays, whereas the player always has the option of taking one or more cards.
  */
  //use to evaluate if the player is bust
  //use for regular player and for dealer
  const playerGetHandValue = (cards) => {
    let totalValue = 0;
    let {reorderedCards, numberAces} = reorderPlayerCards(cards);
    //get the player's cards value
    //one ace at end of list
    //multiple aces at end of list; 2 or more aces

    for (let i = 0; i < reorderedCards.length; i++) {
      let valueStr = reorderedCards[i].slice(1);
      let valueNum;
      if (isNaN(valueStr)) {
        if (valueToNum[valueStr]) {
          valueNum = valueToNum[valueStr]
        } else if (valueStr === 'a') {
          //need to know what is the cards value before aces start
          //need to know the number of aces
          let acesPossibleValues = acesCountToPossibleValuesMap.get(numberAces);
          for (let j = 0; j < acesPossibleValues.length; j++) {
            if (acesPossibleValues[j] + totalValue <= 21) {
              valueNum = acesPossibleValues[j];
              console.log('player totalValue', totalValue + valueNum)
              return totalValue + valueNum;
            } else if (acesPossibleValues[j] + totalValue > 21 && j === acesPossibleValues.length - 1) {
              valueNum = acesPossibleValues[j];
              console.log('player totalValue', totalValue + valueNum)
              return totalValue + valueNum;
            }
          }
        }
      } else {
        valueNum = parseInt(valueStr, 10);
      }
      totalValue += valueNum;
    }
    console.log('player totalValue', totalValue)
    return totalValue;
  }

  //deal cards to a player
  const dealOneCardToPlayer = (player, shuffledDeck) => {
    //BUG? think I have to shuffleDeck for each new round?
    // if (!shuffledDeck.length) {
    //   deck = createDeck();
    //   shuffledDeck = shuffleDeck(deck);
    // }

    let copyShuffledDeck = shuffledDeck.slice(0);

    let card = copyShuffledDeck.pop();
    console.log('card', card);
    let curPlayerHand = playerHands[player].slice(0);
    let updatedPlayerHand = curPlayerHand.concat([card]);
    setPlayerHands({...playerHands, [player]: updatedPlayerHand});
    setShuffledDeck(copyShuffledDeck);

    let curPlayerHandValue = playerGetHandValue(updatedPlayerHand);
    if (curPlayerHandValue >= 21) {
      setPlayerCardTotals({...playerCardTotals, [player]: curPlayerHandValue})
      setGameStatus(gameStatus + 1);
    }

    return updatedPlayerHand;
    //shuffledDeck has to have cards
    //handle player request for another card
    //handle player request to stop
  }

  const playerIsDone = (player) => {
    //setFinishedPlayers(finishedPlayers.concat([player]));
    if (player === 'p') {
      let playerTotal = playerGetHandValue(playerHands['p']);
      setPlayerCardTotals({...playerCardTotals, ['p']: playerTotal});
      setGameStatus(2);
    }
    if (player === 'd') {
      setGameStatus(3);
    }
  }


  //TODO
  //evalute winners/losers
  //need to keep track of each player's total hand value at the end of the round
  const getWinnersLosers = () => {
    let losers = [];
    let winners = [];

    if (playerCardTotals['p'] === 21 && playerCardTotals['d'] === 21) {
      return {losers, winners};
    }

    if (playerCardTotals['d'] <= 21) {
      if (playerCardTotals['p'] < playerCardTotals['d'] || playerCardTotals['p'] > 21) {
        losers.push('p');
        winners.push('d');  
      }
    }

    if (playerCardTotals['p'] <= 21) {
      if (playerCardTotals['d'] < playerCardTotals['p'] || playerCardTotals['d'] > 21) {
        losers.push('d');
        winners.push('p');  
      }
    }

    return {losers, winners};
  }

  //init a game
  //TODO decide what are the conditions that determine when a game will start
  

  //each player's turn
  //while the player is playing and has not bust
  //respond to player action (getNewCard or Stop)
  /*
    during each turn need to get player move (hit or stop)
    if hit, then dealOneCardToPlayer()
      then playerGetHandValue()
      if bust then move the player to losers array
      else wait for next turn (reset the timer)
  */

  //dealer's turn
  //refer to the website logic, this should be straightforward



  //TODO
  //reset the game
  const resetGame = () => {
    //shuffle deck on each round

  }

  const getDealerCardsHidden = () => {
    let hiddenFormattedCards = playerHands['d'].map((card, idx) => {
      if (idx === 1) {
        return 'hidden';
      }
      return card;
    });
    return hiddenFormattedCards;
  }

  useEffect(() => {
    //deal out the initial cards (2 cards per player, including dealer)
    const initialDeal = (shuffledDeck) => {
      for (let i = 0; i < (players.length) * 2; i++) {
        let card = shuffledDeck.pop();
        let p = i < players.length ? players[i] : players[i % players.length];
        playerHands[p].push(card);
      }
      console.log('playerHands', playerHands);
      //second card
    }

    const initGame = () => {
      let newDeck = createDeck();
      let newShuffledDeck = shuffleDeck(newDeck);
      setShuffledDeck(newShuffledDeck);
      initialDeal(newShuffledDeck);
    } 

    if (gameStatus === 0) {
      initGame();
      setGameStatus(1);
    }

    if (gameStatus === 2) {
      /* dealer turn
        When the dealer has served every player, the dealers face-down card is turned up. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand. 
        TEST ???If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21), the dealer must count the ace as 11 and stand. The dealer's decisions, then, are automatic on all plays, whereas the player always has the option of taking one or more cards.
      */
        setIsDealerCardHidden(false);
        let dealerCardsValue = playerGetHandValue(playerHands['d']);

        //BUG where infinite loop
        while(dealerCardsValue <= 16) {
          let updatedHand = dealOneCardToPlayer('d', shuffledDeck);
          console.log('updatedHand', updatedHand)
          dealerCardsValue = playerGetHandValue(updatedHand);
          console.log('dealerCardsValue', dealerCardsValue)
        }
        setPlayerCardTotals(p => { return {...p, ['d']: dealerCardsValue}});
        setGameStatus(3)
    }
  }, [gameStatus]);


  let dealerCards = isDealerCardHidden ? getDealerCardsHidden(): playerHands['d'];
  let {losers, winners} = getWinnersLosers();
  console.log('playerCardTotals', playerCardTotals);

  return (
    <div>
      <h1>Game</h1>
      <button onClick={startGameClick}>Start Game</button>
      <div>
        <div>
          <h2>Player cards</h2>
          {gameStatus === 1 && (
            <>
              <button onClick={() => dealOneCardToPlayer('p', shuffledDeck)}>Hit</button>
              <button onClick={() => playerIsDone('p')}>Stay</button>
            </>
          )}
        </div>
        <p>{playerHands.p.join(', ')}</p>  
      </div>  
      <div>
        <h2>Dealer cards</h2>
        <p>{dealerCards.join(', ')}</p>  
      </div> 
      {gameStatus === 3 && (
        <div>
          <div>Winner: {winners.join(', ')}</div>
          <div>Loser: {losers.join(', ')}</div>
        </div>
      )}
    </div>
  )
}

export default Game;