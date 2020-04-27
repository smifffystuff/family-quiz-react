import React, {useState, useEffect} from 'react';

import './UserAnswers.css';
import Card from '../../shared/components/UIElements/Card';

const UserAnswers = props => {
  const [correctScore, setCorrectScore] = useState(0);
  const [wrongScore, setWrongScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    const currentCorrectScore = props.answers.filter(
      answer => answer.correct === 'YES'
    ).length;
    setCorrectScore(currentCorrectScore);
    const currentWrongScore = props.answers.filter(
      answer => answer.correct === 'NO'
    ).length;
    setWrongScore(currentWrongScore);
    setAnswered(currentCorrectScore + currentWrongScore);
  }, [props.answers]);

  return (
    <Card className="answer-list__content" style={{margin: '1rem'}}>
      <h2>{props.user.name}</h2>
      <h3 className="center">
        {correctScore > 0 && `${correctScore} Correct`}
        {'   '}
        {wrongScore > 0 && `${wrongScore} Wrong`}{' '}
        {answered > 0 && `of ${answered} answered`}
      </h3>
      <ul className="answer-list">
        {props.answers.map(answer => (
          <li key={answer.id} className="answer-item">
            {/* <select
              style={{marginRight: '1rem'}}
              onChange={e => props.onChangeSelect(e, props.user.id, answer.id)}
              value={answer.correct}
            >
              <option value="NA"></option>
              <option value="YES">Correct</option>
              <option value="NO">Wrong</option>
            </select> */}
            {answer.number}. {answer.answer} -{' '}
            {answer.correct === 'YES'
              ? 'Correct'
              : answer.correct === 'NO'
              ? 'wrong'
              : ''}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default UserAnswers;
