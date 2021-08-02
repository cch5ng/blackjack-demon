import {useEffect, useState} from 'react';

import PlayerHand from './PlayerHand';
import './Game.css';

//constants
const SHAPES = ['h', 'd', 'c', 's'];
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
  const [displayResults, setDisplayResults] = useState(true);

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
    setDisplayResults(true);
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
              return totalValue + valueNum;
            } else if (acesPossibleValues[j] + totalValue > 21 && j === acesPossibleValues.length - 1) {
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

  const closeDisplayResults = () => {
    setDisplayResults(false);
  }

  const getResultsMessage = () => {
    let {losers, winners} = getWinnersLosers();
    if (losers.length === 0 && winners.length === 0) {
      return `There were no winners.`;
    }
    if (winners.indexOf('p') > -1) {
      return `You won!`;
    }
    if (losers.indexOf('p') > -1) {
      return `You lost.`;
    }
  }

  let dealerHandsLen = playerHands['d'].length;
  let dealerCardTotal = playerCardTotals['d'];

  useEffect(() => {

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
  
      return {reorderedCards, numberAces};
    }
  
    const dealerGetHandValue = (cards) => {
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
              if (acesPossibleValues[j] + totalValue >= 17 && acesPossibleValues[j] + totalValue <= 21) {
                valueNum = acesPossibleValues[j];
                return totalValue + valueNum;
              } else if (acesPossibleValues[j] + totalValue > 21 && j === acesPossibleValues.length - 1) {
                valueNum = acesPossibleValues[j];
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
      return totalValue;
    }

    const dealOneCardToDealer = (playerCards, shuffledDeck) => {
      let copyPlayerCards = playerCards.slice(0);
      let copyShuffledDeck = shuffledDeck.slice(0);
      let card = copyShuffledDeck.pop();
      copyPlayerCards.push(card);

      return {updatedPlayerHand: copyPlayerCards, copyShuffledDeck}    
    }

    if (gameStatus === 2) {
      setIsDealerCardHidden(false);
      let dealerCardsValue = dealerGetHandValue(playerHands['d']);
      let dealerNewCardsCount = 0;
      let dealerCards = playerHands['d'];
      let lastShuffledDeck;
      
      while (dealerGetHandValue(dealerCards) <= 16) {
        if (dealerNewCardsCount === 0) {
          let {updatedPlayerHand, copyShuffledDeck} = dealOneCardToDealer(dealerCards, shuffledDeck)
          dealerCardsValue = dealerGetHandValue(updatedPlayerHand);
          setPlayerHands({...playerHands, d: updatedPlayerHand})
          setShuffledDeck(copyShuffledDeck);
          lastShuffledDeck = copyShuffledDeck;
          dealerCards = updatedPlayerHand;
          dealerNewCardsCount += 1;
        } else {
          let {updatedPlayerHand, copyShuffledDeck} = dealOneCardToDealer(dealerCards, lastShuffledDeck)
          dealerCards = updatedPlayerHand;
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

  return (
    <div className="game_container">
      <div className="game_header">
        <h1>Game</h1>
        {(gameStatus === -1 || gameStatus === 3) && (
          <div className="btn_container_game_header">
            <button onClick={startGameClick} className="btn">Start New Game</button></div>
        )}
        {gameStatus === 1 && (
          <div className="btn_container_game_header">
            <button onClick={() => dealOneCardToPlayer('p', shuffledDeck)}
              className="btn">Hit</button>
            <button onClick={() => playerIsDone('p')} className="btn">Stay</button>
          </div>
        )}
      </div>
      <PlayerHand cards={playerHands.p} player="p" />
      <PlayerHand cards={playerHands.d} player="d" isDealerCardHidden={isDealerCardHidden} />
      {gameStatus === 3 && displayResults === true && (
        <div className="results_container">
          <div className="btn_close_container">
            <button className="btn_close" onClick={closeDisplayResults}>X</button>
          </div>
          <div className="avatar_dealer">TODO</div>
          <div><h2 className="results_message">{getResultsMessage()}</h2></div>
          <div className="text_score">Your score: {playerCardTotals.p}</div>
          <div className="text_score">Dealer's score: {playerCardTotals.d}</div>
          <div className="btn_spacer"><button onClick={startGameClick} className="btn btn_dark">Play Again</button></div>

        </div>
      )}
    </div>
  )
}

export default Game;
