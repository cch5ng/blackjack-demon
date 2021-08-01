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
const players = ['p','d'];

const Game = ({isGamePaused}) => {

//vars game state
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [playerHands, setPlayerHands] = useState({d: [], p: []});
    //key is player id and value is array of their current cards; dealer is 'd'
    //2nd card of dealer should be hidden on client side
  const [playerCardTotals, setPlayerCardTotals] = useState({d: 0, p: 0});
  const [gameStatus, setGameStatus] = useState(-1) 
    //possible values -1 not started, 0 started in play, 1 player turn, 2 dealer turn, 3 game over
  const [isDealerCardHidden, setIsDealerCardHidden] = useState(true);

  console.log('gameStatus', gameStatus);
  console.log('shuffledDeck', shuffledDeck);

  //deal out the initial cards (2 cards per player, including dealer)
  const initialDeal = (shuffledDeck) => {
    let dealerCards = [];
    let playerCards = [];
    for (let i = 0; i < (players.length) * 2; i++) {
      let card = shuffledDeck.pop();
      let p = i < players.length ? players[i] : players[i % players.length];
      if (p === 'p') {
        dealerCards.push(card);
      }
      if (p === 'd') {
        playerCards.push(card);
      }
      playerHands[p].push(card);
    }
    console.log('playerCards', {d: dealerCards, p: playerCards})
    setPlayerHands({p: playerCards, d: dealerCards});
  }

  const initGame = () => {
    let newDeck = createDeck();
    let newShuffledDeck = shuffleDeck(newDeck);
    setShuffledDeck(newShuffledDeck);
    initialDeal(newShuffledDeck);
  } 

  const resetGame = () => {
    //shuffle deck on each round
    setShuffledDeck([]);
    setPlayerHands({d: [], p: []});
    setPlayerCardTotals({d: 0, p: 0});
    setIsDealerCardHidden(true);
    setGameStatus(-1) 
  }

  const startGameClick = () => {
    if (gameStatus === 3) {
      resetGame();
      initGame();
      setGameStatus(1);  
    }
    if (gameStatus === -1) {
      initGame();
      setGameStatus(1);
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

  //shuffling on each new round
  const shuffleDeck = (deck) => {
    const shuffledDeck = [];
    const copyDeck = deck.slice(0);

    while (copyDeck.length) {
      let curLen = copyDeck.length;
      let randIdx = Math.floor(Math.random() * curLen);
      let removedCard = copyDeck.splice(randIdx, 1);
      shuffledDeck.push(removedCard[0]);
    }
    console.log('shuffledDeck', shuffledDeck);
    return shuffledDeck;
  }

  //array of card strings
  const doPlayerCardsContainAce = (cards) => {
    console.log('cards', cards)
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

    return {reorderedCards, numberAces};
  }

  //use for regular player
  const playerGetHandValue = (cards) => {
    let totalValue = 0;
    let {reorderedCards, numberAces} = reorderPlayerCards(cards);

    for (let i = 0; i < reorderedCards.length; i++) {
      let valueStr = reorderedCards[i].slice(1);
      let valueNum;
      if (isNaN(valueStr)) {
        if (valueToNum[valueStr]) {
          valueNum = valueToNum[valueStr]
        } else if (valueStr === 'a') {
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

  //deal cards to a regular player
  const dealOneCardToPlayer = (player, shuffledDeck) => {
    let copyShuffledDeck = shuffledDeck.slice(0);
    let card = copyShuffledDeck.pop();
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
  }

  const playerIsDone = (player) => {
    if (player === 'p') {
      let playerTotal = playerGetHandValue(playerHands[player]);
      setPlayerCardTotals({...playerCardTotals, [player]: playerTotal});
      setGameStatus(2);
    }
    if (player === 'd') {
      setGameStatus(3);
    }
  }

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

  const getDealerCardsHidden = () => {
    let hiddenFormattedCards = playerHands['d'].map((card, idx) => {
      if (idx === 1) {
        return 'hidden';
      }
      return card;
    });
    return hiddenFormattedCards;
  }

  let dealerHandsLen = playerHands['d'].length;
  let dealerCardTotal = playerCardTotals['d'];

  useEffect(() => {

    const doPlayerCardsContainAce = (cards) => {
      console.log('cards', cards)
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
  
      return {reorderedCards, numberAces};
    }
  
    const dealerGetHandValue = (cards) => {
      let totalValue = 0;
      let {reorderedCards, numberAces} = reorderPlayerCards(cards);
      console.log('reorderedCards', reorderedCards)
      console.log('numberAces', numberAces)

      for (let i = 0; i < reorderedCards.length; i++) {
        let valueStr = reorderedCards[i].slice(1);
        let valueNum;
        if (isNaN(valueStr)) {
          if (valueToNum[valueStr]) {
            valueNum = valueToNum[valueStr]
          } else if (valueStr === 'a') {
            let acesPossibleValues = acesCountToPossibleValuesMap.get(numberAces);
            for (let j = 0; j < acesPossibleValues.length; j++) {
              if (acesPossibleValues[j] + totalValue >= 17 && acesPossibleValues[j] + totalValue <= 21) {
                valueNum = acesPossibleValues[j];
                console.log('dealer totalValue', totalValue + valueNum)
                return totalValue + valueNum;
              } else if (acesPossibleValues[j] + totalValue > 21 && j === acesPossibleValues.length - 1) {
                valueNum = acesPossibleValues[j];
                console.log('dealer totalValue', totalValue + valueNum)
                return totalValue + valueNum;
              } else if (acesPossibleValues[j] + totalValue < 17) {
                valueNum = acesPossibleValues[j];
                return totalValue + valueNum;
              }
            }
          }
        } else {
          valueNum = parseInt(valueStr, 10);
        }
        totalValue += valueNum;
      }
      console.log('dealer totalValue', totalValue)
      return totalValue;
    }

    const dealOneCardToDealer = (playerCards, shuffledDeck) => {
      let copyPlayerCards = playerCards.slice(0);
      let copyShuffledDeck = shuffledDeck.slice(0);
      let card = copyShuffledDeck.pop();
      copyPlayerCards.push(card);
      console.log('curPlayerHand', copyPlayerCards)

      return {updatedPlayerHand: copyPlayerCards, copyShuffledDeck}    
    }

    if (gameStatus === 2) {
      /* dealer turn
        When the dealer has served every player, the dealers face-down card is turned up. If the total is 17 or more, it must stand. If the total is 16 or under, they must take a card. The dealer must continue to take cards until the total is 17 or more, at which point the dealer must stand. 
        TEST ???If the dealer has an ace, and counting it as 11 would bring the total to 17 or more (but not over 21), the dealer must count the ace as 11 and stand. The dealer's decisions, then, are automatic on all plays, whereas the player always has the option of taking one or more cards.
      */
      setIsDealerCardHidden(false);
      let dealerCardsValue = dealerGetHandValue(playerHands['d']);
      let dealerNewCardsCount = 0;
      let dealerCards = playerHands['d'];
      console.log('initDealerCardsValue', dealerCardsValue)
      console.log('initDealerHand', playerHands['d'])
      console.log('initShuffledDeck', shuffledDeck)
      let lastShuffledDeck;
      
      while (dealerGetHandValue(dealerCards) <= 16) {
        if (dealerNewCardsCount === 0) {
          let {updatedPlayerHand, copyShuffledDeck} = dealOneCardToDealer(dealerCards, shuffledDeck)
          console.log('0 updatedPlayerHand', updatedPlayerHand)
          console.log('0 copyShuffledDeck', copyShuffledDeck)
          dealerCardsValue = dealerGetHandValue(updatedPlayerHand);
          setPlayerHands({...playerHands, d: updatedPlayerHand})
          setShuffledDeck(copyShuffledDeck);
          lastShuffledDeck = copyShuffledDeck;
          dealerCards = updatedPlayerHand;
          dealerNewCardsCount += 1;
        } else {
          let {updatedPlayerHand, copyShuffledDeck} = dealOneCardToDealer(dealerCards, lastShuffledDeck)
          dealerCards = updatedPlayerHand;
          console.log('1 updatedPlayerHand', updatedPlayerHand)
          console.log('1 copyShuffledDeck', copyShuffledDeck)
          dealerCardsValue = dealerGetHandValue(updatedPlayerHand);
          setPlayerHands({...playerHands, d: updatedPlayerHand})
          setShuffledDeck(copyShuffledDeck);
          lastShuffledDeck = copyShuffledDeck;
          dealerNewCardsCount += 1;
        }
      }

      setPlayerCardTotals(p => { return {...p, d: dealerCardsValue}});
      setGameStatus(3);
    }
  }, [gameStatus, shuffledDeck.length, dealerHandsLen, dealerCardTotal, shuffledDeck, playerHands]);

  let dealerCards = isDealerCardHidden ? getDealerCardsHidden(): playerHands['d'];
  let {losers, winners} = getWinnersLosers();
  console.log('playerCardTotals', playerCardTotals);

  return (
    <div>
      <h1>Game</h1>
      {(gameStatus === -1 || gameStatus === 3) && (
        <button onClick={startGameClick}>Start New Game</button>
      )}
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