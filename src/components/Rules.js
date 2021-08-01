import './Rules.css';

const Rules = ({resumeGame}) => {
  return (
    <div className="rules_container">
      <h1>Blackjack Rules</h1>
      <button onClick={resumeGame}>Go to Game</button>

      <div>
        Overview: Two player card game (using a tradition 52-card deck). You vs the dealer.
      </div>
      <div>
        Objective: beat the dealer without going over 21 in cards.
      </div>
      <div>
        <h2>Card evaluation</h2>
        <ul>
          <li>Number cards are evaluated as numbers: For example, 2 of Hearts = 2</li>
          <li>Face cards are evaluated as 10: For example, Jack, Queen, or King = 10</li>
          <li>Ace cards can be interpreted as 1 or 11 by the player. For example, if the player has 2 cards, Ace of Hearts and 4 of Clubs, the Ace can be interpreted as 1 or 11 resulting in a total card value of either 1 + 4 = 5 or 11 + 4 = 15.</li>
          <li>Player is bust: the player's total cards value is over 21.</li>
          <li>Player hits blackjack: the player's total cards value is 21.</li>
        </ul>
      </div>

      <div>
        <h2>Game Play</h2>
        <ul>
          <li>Cards will be shuffled at the start of each round.</li>
          <li>Initial cards will be dealt: 2 cards face up for player, 2 cards for the dealer (one face down)</li>
          <li>The player takes the first turn. The player can choose to Hit (get an additional card) multiple times or Stay (end their turn for the round). If the player busts (card total value exceeds 21) then the player loses automatically.</li>
          <li>The dealer takes their turn. After the dealer's card total value reaches 17 or higher, the dealer must stay. If the dealer's card total value is 16 or less, they must continue to hit.</li>
          <li>The end of the game. After the dealer has chosen to stay, goes bust, or hits blackjack.</li>
        </ul>
      </div>

      <div>
        <h2>Winners/Losers</h2>
        <ul>
          <li>If the player goes bust, the player loses.</li>
          <li>If the dealer goes bust and the player does not go bust, the player wins.</li>
          <li>If the player hits blackjack and the dealer does not hit blackjack, the player wins. If both hit blackjack, there is no winner.</li>
          <li>If the player's hand is greater than the dealer's hand (but not bust) at the end of the game, the player wins. If the hands are equal, there is no winner. Otherwise, if the dealer's hand is greater than the player's hand, the dealer wins.</li>
        </ul>
      </div>

      <button onClick={resumeGame}>Go to Game</button>
    </div>
  )
}

export default Rules;