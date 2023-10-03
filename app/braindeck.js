"use client"
import Image from 'next/image'
import React, { useState, useEffect } from 'react';

export default function BrainDeck() {

    const LEVELS = {
        '왕초보': {
          size: 12,
          operators: ['+', '-'],
          operatorColor: 'bg-yellow-300'
        },
        '초보자': {
          size: 16,
          operators: ['+', '-'],
          operatorColor: 'bg-yellow-300'
        },
        '중급자': {
          size: 16,
          operators: ['+', '-', '×', '÷'],
          operatorColor: 'bg-yellow-300'
        },
        '고급자': {
          size: 16,
          operators: ['+', '-', '×', '÷'],
          operatorColor: 'bg-gray-200'
        },
        '초고급자': {
          size: 20,
          operators: ['+', '-', '×', '÷'],
          operatorColor: 'bg-gray-200'
        }
      };
      
  const [level, setLevel] = useState('중급자');
  const [cards, setCards] = useState(generateCards(level));
  const [selectedCards, setSelectedCards] = useState([]);
  const [isCheckButtonActive, setIsCheckButtonActive] = useState(false);
  const [targetNumber, setTargetNumber] = useState(generateTargetNumber(cards,level));

  const [flippedCards, setFlippedCards] = useState([]);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const [showHint, setShowHint] = useState(false); // 힌트 기능 활성화 여부
  const [correctCount, setCorrectCount] = useState(0); // 맞춘 갯수
  const [timer, setTimer] = useState(0); // 타이머

  
  function generateCards(level) {
    const levelConfig = LEVELS[level];
    const numbers = Array.from({ length: levelConfig.size - levelConfig.operators.length }, (_, index) => index + 1);
    const allCards = [...numbers, ...levelConfig.operators];

    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [alphabets[i], alphabets[j]] = [alphabets[j], alphabets[i]];
    }

    return allCards.map((card, idx) => ({ value: card, back: alphabets[idx] }));
  }

  function generateTargetNumber(cards, level, retryCount = 0) {
    if (retryCount > 100) { // 재시도 횟수를 제한
        throw new Error("Failed to generate a valid target number after 100 tries.");
    }
  
    let numberCards = cards.map(card => card.value).filter(value => typeof value === 'number');
    let operatorCards = LEVELS[level].operators;
  
    // 무작위로 숫자 2개와 연산자 1개를 선택합니다.
    let num1 = numberCards[Math.floor(Math.random() * numberCards.length)];
    let num2 = numberCards[Math.floor(Math.random() * numberCards.length)];
    let operator = operatorCards[Math.floor(Math.random() * operatorCards.length)];
  
    // 연산을 수행합니다.
    let result;
    switch(operator) {
        case '+': result = num1 + num2; break;
        case '-': result = num1 - num2; break;
        case '×': result = num1 * num2; break;
        case '÷': if (num2 !== 0 && Number.isInteger(num1 / num2)) result = num1 / num2; break;
        default: break;
    }
  
    // 결과가 자연수이고 연산이 성공한 경우에만 반환합니다.
    if (result && result > 0 && Number.isInteger(result)) {
        return result;
    } else {
        return generateTargetNumber(cards, level, retryCount + 1); // 재귀적으로 다시 시도합니다.
    }
}
  

  function selectCard(index) {
    // 이미 선택된 카드면 선택 해제
    if (selectedCards.includes(index)) {
      setSelectedCards(selectedCards.filter(cardIndex => cardIndex !== index));
    } else {
      // 카드 3장 선택 제한
      if (selectedCards.length < 3) {
        setSelectedCards([...selectedCards, index]);
      }
    }
  }

  function changeLevel(newLevel) {
    setLevel(newLevel);
    setCards(generateCards(newLevel));
    setSelectedCards([]);
    setTargetNumber(generateTargetNumber(generateCards(newLevel), newLevel));
    setCorrectCount(0);
  }

  function checkAnswer() {
    const selectedValues = selectedCards.map(index => cards[index].value);
  
    setFlippedCards(selectedCards);
    setTimeout(() => {
      setFlippedCards([]);  // 3초 후 카드를 다시 뒤집습니다.
      setSelectedCards([]); // 선택된 카드 초기화
    }, 3000);

    // 숫자와 연산자를 구분합니다.
    if(typeof selectedValues[1] === 'string' && typeof selectedValues[0] === 'number' && typeof selectedValues[2] === 'number'){
/*       const numbers = selectedValues.filter(value => typeof value === 'number');
      const operator = selectedValues.find(value => typeof value === 'string'); */
      const numbers = [selectedValues[0], selectedValues[2]]
      const operator = selectedValues[1]

      let result;
  
      switch(operator) {
        case '+': result = numbers[0] + numbers[1]; break;
        case '-': result = numbers[0] - numbers[1]; break;
        case '×': result = numbers[0] * numbers[1]; break;
        case '÷': if (numbers[1] !== 0) result = numbers[0] / numbers[1]; break;
        default: break;
      }

      // 결과가 타겟 넘버와 일치하는지 확인합니다.
      if (result === targetNumber) {
        
        setIsAnswerCorrect(true);
        setCorrectCount(correctCount+1); 
        
        setTimeout(() => {
            setTargetNumber(generateTargetNumber(cards, level));
            setIsAnswerCorrect(false);
        }, 3000);

      } else {
        // 오답일 경우
      }
    } else {

    }
    
  }
  

  function restartGame() {
    setCards(generateCards(level));
    setSelectedCards([]);
    setTargetNumber(generateTargetNumber(generateCards(level), level));
    setCorrectCount(0);
  }
  
  function handleHintClick() {
    setShowHint(true);
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
  }

  function handleShuffleClick() {
      restartGame();
  }

  useEffect(() => {
    if (selectedCards.length === 3) {
      setIsCheckButtonActive(true);
    } else {
      setIsCheckButtonActive(false);
    }
  }, [selectedCards]);

  

  // ... (Other functionalities)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="container bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
  
        {/* 난이도 선택 버튼들 */}
        <div className="mb-6 flex justify-center flex-wrap">
          {Object.keys(LEVELS).map((lvl) => (
            <button
              key={lvl}
              className={`mr-2 mb-2 px-4 py-2 rounded ${level === lvl ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-500 hover:bg-blue-600'} text-white transition duration-150`}
              onClick={() => changeLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
  
        {/* 타겟 넘버 표시 */}
        <div className="mb-6 text-[2rem] font-black text-center p-4 border-b-2">
        <div className="targetNumber">
            {isAnswerCorrect ? "🥳 정답입니다!" : `타겟넘버: ${targetNumber}`}
        </div>
        </div>
  
        {/* 카드 배열 */}
        <div className="grid grid-cols-3 gap-4 mb-6 md:grid-cols-4 lg:grid-cols-4">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className={`card cursor-pointer text-[2.5rem] font-black p-5 rounded text-center shadow-lg transition-transform duration-150 transform ${selectedCards.includes(index) ? 'bg-green-300 scale-105' : 'bg-gray-200 hover:scale-105 hover:shadow-xl'} ${!selectedCards.includes(index) && typeof card.value === 'string' ? LEVELS[level].operatorColor : ''}`}
              onClick={() => selectCard(index)}
            >
              {flippedCards.includes(index) || showHint ? card.value : card.back}
            </div>
          ))}
        </div>
  
        {/* 확인 버튼 */}

      </div>
      <div className="statusBox bg-white p-4 rounded-lg shadow-md ml-4">
        
        <div className='flex justify-center my-3'>
        {selectedCards.length < 1 ? ( <div className='border-[#999] border-[1px] px-2 py-2 m-1 rounded text-white'>
              ||
            </div> ) : ''}
        {selectedCards.map((card, index) => (
            <div key={index} className='border-[#999] border-[1px] px-2 py-2 m-1 rounded'>
              {cards[card].back}
            </div>
            ))}
        </div>
        <div>
        <button 
          className={`w-full text-lg text-white py-3 mb-4 rounded transition-colors duration-150 ${isCheckButtonActive ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-300 cursor-not-allowed'}`}
          disabled={!isCheckButtonActive}
          onClick={checkAnswer}
        >
          확인
        </button>
        </div>
        <button 
          className="hintButton bg-blue-500 text-white px-4 py-2 mb-4" 
          onClick={handleHintClick}
        >
          힌트
        </button>
        <button 
          className="shuffleButton bg-green-500 text-white px-4 py-2 mb-4" 
          onClick={handleShuffleClick}
        >
          섞기
        </button>
        <p>맞춘 갯수: {correctCount}</p>
      </div>
    </div>
  );
  
}