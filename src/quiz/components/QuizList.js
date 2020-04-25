import React from 'react';

import Card from '../../shared/components/UIElements/Card';
import QuizItem from './QuizItem';
import Button from '../../shared/components/FormElements/Button';
import './QuizList.css';

const QuizList = props => {
  if (props.items.length === 0) {
    return (
      <div className="quiz-list center">
        <Card>
          <h2>No quizzes found. Maybe create one?</h2>
          <Button to="/quizzes/new">Share Quiz</Button>
        </Card>
      </div>
    );
  }

  return (
    <ul className="quiz-list">
      {props.items.map(quiz => (
        <QuizItem key={quiz.id} quiz={quiz} onDelete={props.onDeletePlace} />
      ))}
    </ul>
  );
};

export default QuizList;
