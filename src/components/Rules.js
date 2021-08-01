import './Rules.css';

const Rules = ({resumeGame}) => {
  return (
    <div className="rules_container">
      <h1>Rules</h1>
      <button onClick={resumeGame}>Go to Game</button>
    </div>
  )
}

export default Rules;