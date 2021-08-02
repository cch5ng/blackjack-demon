import Spritesheet from 'react-responsive-spritesheet';

import sprite from '../atlasnye-884206_1280_blue.png';
import './PlayerHand.css';
import ace_clubs_card from '../ace_clubs_card.png';
import ace_spades_card from '../ace_spades_card.png';
import ace_diamonds_card from '../ace_diamonds_card.png';

const CARD_STR_AR = ["ha", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "hj", "hq", "hk", "placeholder", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10", "dj", "dq", "dk", "placeholder", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "cj", "cq", "ck", "placeholder", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "sj", "sq", "sk"];

const CARD_STR_TO_IMG_SRC = {
  da: ace_diamonds_card,
  ca: ace_clubs_card,
  sa: ace_spades_card
}

//TODO need to handle row2 - 4, col1 exceptions

const PlayerHand = ({cards, player, isDealerCardHidden }) => {
  let curPlayer = player === 'p' ? `Player`: `Dealer`;
  return (
    <div className="player_hand_container">
      <div><h2>{curPlayer } Hand</h2></div>
      <div className="cards_container">
        {cards.map((card, idx) => {
          if (CARD_STR_AR.indexOf(card) > -1) {
            let startFrame = CARD_STR_AR.indexOf(card) + 1;
            //TODO handle case when dealer card2 should be hidden
            if (player === 'd' && isDealerCardHidden === true && idx === 1) {
              return (<div key={card}>Hidden Card</div>)
            }
            return (
              <Spritesheet
                className="sprite"
                image={sprite}
                widthFrame={97.84}
                heightFrame={143}
                steps={52}
                startAt={startFrame}
                autoplay={false}
                key={card}
              />
            )  
          } else {
            let src = CARD_STR_TO_IMG_SRC[card]
            return <div key={card}><img src={src} alt="card image" /></div>
          }

        })}
      </div>  
    </div>
  )
}

export default PlayerHand;

/*
        <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={1}
        autoplay={false}
      />
      <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={13}
        autoplay={false}
      />
      <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={16}
        autoplay={false}
      />
      <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={14}
        autoplay={false}
      />
      <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={27}
        autoplay={false}
      />
      <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={28}
        autoplay={false}
      />
      <Spritesheet
        className="sprite"
        image={sprite}
        widthFrame={97.84}
        heightFrame={143}
        steps={52}
        startAt={26}
        autoplay={false}
      />
*/