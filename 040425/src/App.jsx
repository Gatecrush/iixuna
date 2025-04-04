import { useState, useEffect } from 'react';
    import './App.css';
    import { createDeck, shuffleDeck, getValue } from './modules/deck';
    import { dealInitialCards } from './modules/dealing';
    import { handleCapture, handleBuild } from './modules/turns';
    import { calculateScores } from './modules/scoring';
    import { isValidCapture, CaptureValidator } from './modules/captureLogic.js';
    import { isValidBuild } from './modules/buildLogic.js';

    function App() {
      const [deck, setDeck] = useState([]);
      const [player1Hand, setPlayer1Hand] = useState([]);
      const [player2Hand, setPlayer2Hand] = useState([]);
      const [tableCards, setTableCards] = useState([]);
      const [player1Score, setPlayer1Score] = useState(0);
      const [player2Score] = useState(0);
      const [currentPlayer, setCurrentPlayer] = useState(1);
      const [lastCapturer, setLastCapturer] = useState(null);
      const [gamePhase, setGamePhase] = useState('initialDeal');
      const [message, setMessage] = useState('');
      const [selectedCard, setSelectedCard] = useState(null);
      const [selectedTableCards, setSelectedTableCards] = useState([]);
      const [player1Pile, setPlayer1Pile] = useState([]);
      const [player2Pile, setPlayer2Pile] = useState([]);
      const [hasPlayedCard, setHasPlayedCard] = useState(false);
      const [round, setRound] = useState(1);
      const [isRoundOver, setIsRoundOver] = useState(false);

      useEffect(() => {
        resetGame();
      }, []);

      const resetGame = () => {
        const newDeck = createDeck();
        shuffleDeck(newDeck);
        setDeck(newDeck);
        setPlayer1Hand([]);
        setPlayer2Hand([]);
        setTableCards([]);
        setPlayer1Score(0);
        const [player2Score] = useState(0);
        setCurrentPlayer(1);
        setLastCapturer(null);
        setGamePhase('initialDeal');
        setMessage('');
        setSelectedCard(null);
        setSelectedTableCards([]);
        setPlayer1Pile([]);
        setPlayer2Pile([]);
        setHasPlayedCard(false);
        setRound(1);
        setIsRoundOver(false);
      };

      const initializeDeal = () => {
        let { p1Hand, p2Hand, table, updatedDeck } = dealInitialCards(deck);
        setPlayer1Hand(p1Hand);
        setPlayer2Hand(p2Hand);
        setTableCards(table);
        setDeck(updatedDeck);
        setGamePhase('play');
        setMessage("Player 1's turn");
        setHasPlayedCard(false);
        setIsRoundOver(false);
      };

      const canCapture = (card, tableCards) => {
        if (!card || !tableCards || tableCards.length === 0) return false;

        for (let i = 0; i < (1 << tableCards.length); i++) {
          const subset = [];
          let sum = 0;

          for (let j = 0; j < tableCards.length; j++) {
            if ((i >> j) & 1) {
              subset.push(tableCards[j]);
              sum += tableCards[j].value;
            }
          }

          if (sum === card.value && subset.length > 0) {
            return true; // Found a capturing combination
          }
        }

        return false; // No capturing combination found
      };

      const canBuild = (card, tableCards, playerHand) => {
        if (!card || !tableCards || tableCards.length === 0 || !playerHand) return false;

        const totalValue = card.value + tableCards.reduce((acc, c) => acc + c.value, 0);

        return playerHand.some(c => c.value === totalValue);
      };

      const playTrail = () => {
        if (selectedCard && !hasPlayedCard) {
          // Remove the played card from the player's hand
          if (currentPlayer === 1) {
            setPlayer1Hand(player1Hand.filter(card => card.suitRank !== selectedCard.suitRank));
          } else {
            setPlayer2Hand(player2Hand.filter(card => card.suitRank !== selectedCard.suitRank));
          }
          setTableCards([...tableCards, selectedCard]);

          setHasPlayedCard(true);
          switchPlayer();
          setSelectedCard(null);
        }
      };

      const playCapture = () => {
        if (selectedCard && selectedTableCards.length > 0 && !hasPlayedCard) {
          const validCaptures = CaptureValidator.getValidCaptures(selectedCard, tableCards, currentPlayer === 1 ? player1Hand : player2Hand);

          if (!validCaptures.some(capture =>
            capture.length === selectedTableCards.length && capture.every(card => selectedTableCards.includes(card))
          )) {
            alert("Invalid capture! The selected cards do not form a valid capture combination.");
            return;
          }

          const { newP1Score, newP2Score, newTableCards, newLastCapturer, sweep, newMessage } =
            handleCapture(
              selectedCard,
              selectedTableCards,
              currentPlayer,
              player1Score,
              player2Score,
              tableCards,
              lastCapturer,
              player1Pile,
              player2Pile,
              setPlayer1Pile,
              setPlayer2Pile
            );

          setPlayer1Score(newP1Score);
          setPlayer2Score(newP2Score);
          setTableCards(newTableCards);
          setLastCapturer(newLastCapturer);
          if (sweep) setMessage(newMessage);

          // Remove the played card from the player's hand
          if (currentPlayer === 1) {
            setPlayer1Hand(player1Hand.filter(card => card.suitRank !== selectedCard.suitRank));
            setPlayer1Pile([...player1Pile, selectedCard, ...selectedTableCards]);
          } else {
            setPlayer2Hand(player2Hand.filter(card => card.suitRank !== selectedCard.suitRank));
            setPlayer2Pile([...player2Pile, selectedCard, ...selectedTableCards]);
          }

          // Remove captured cards from the table
          setTableCards(tableCards.filter(card => !selectedTableCards.includes(card)));

          setHasPlayedCard(true);
          switchPlayer();
          setSelectedCard(null);
          setSelectedTableCards([]);
        }
      };

      const playBuild = () => {
        if (selectedCard && selectedTableCards.length > 0 && !hasPlayedCard) {
          if (!isValidBuild(selectedCard, selectedTableCards)) {
            alert("Invalid build! The selected cards do not add up to the value of the played card.");
            return;
          }

          const { newTableCards } = handleBuild(
            selectedCard,
            selectedTableCards,
            currentPlayer,
            player1Score,
            player2Score,
            tableCards
          );

          setTableCards(newTableCards);

          // Remove the played card from the player's hand
          if (currentPlayer === 1) {
            setPlayer1Hand(player1Hand.filter(card => card.suitRank !== selectedCard.suitRank));
          } else {
            setPlayer2Hand(player2Hand.filter(card => card.suitRank !== selectedCard.suitRank));
          }

          setHasPlayedCard(true);
          switchPlayer();
          setSelectedCard(null);
          setSelectedTableCards([]);
        }
      };

      const switchPlayer = () => {
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setCurrentPlayer(nextPlayer);
        setMessage(`Player ${nextPlayer}'s turn`);
        setHasPlayedCard(false);
      };

      const calculateFinalScores = () => {
        const { p1Score, p2Score } = calculateScores(
          player1Pile,
          player2Pile,
          player1Score,
          player2Score
        );
        setPlayer1Score(p1Score);
        setPlayer2Score(p2Score);
        setGamePhase('gameOver');
      };

      const handleGameOver = () => {
        calculateFinalScores();
      };

      const selectCard = (card) => {
        setSelectedCard(card);
      };

      const selectTableCard = (card) => {
        setSelectedTableCards(prevSelected => {
          if (prevSelected.includes(card)) {
            return prevSelected.filter(c => c !== card);
          } else {
            return [...prevSelected, card];
          }
        });
      };

      const renderCard = (card, index, source) => {
        if (!card) {
          return null;
        }

        const isSelected = selectedCard === card;
        const isTableCardSelected = selectedTableCards.includes(card);
        const suitColor = card.suit === 'H' || card.suit === 'D' ? 'red' : 'black';

        return (
          <div
            key={`${card.suit}-${card.rank}`}
            className={`card ${isSelected ? 'selected' : ''} ${isTableCardSelected ? 'selected-table-card' : ''}`}
            onClick={() => {
              if (source === 'player' && currentPlayer === 1) {
                selectCard(card);
              } else if (source === 'player' && currentPlayer === 2) {
                selectCard(card);
              } else {
                selectTableCard(card);
              }
            }}
          >
            <div className="rank" style={{ color: suitColor }}>{card.rank}</div>
            <div className="suit" style={{ color: suitColor }}>
              {
                {
                  'C': '♣',
                  'D': '♦',
                  'H': '♥',
                  'S': '\u2660'
                }[card.suit]
              }
            </div>
          </div>
        );
      };

      const dealHands = (deck) => {
        const p1Hand = [];
        const p2Hand = [];

        // Deal 4 cards to each player
        for (let i = 0; i < 4; i++) {
          if (deck.length > 0) p1Hand.push(deck.pop());
          if (deck.length > 0) p2Hand.push(deck.pop());
        }

        return {
          p1Hand,
          p2Hand,
          updatedDeck: [...deck],
        };
      };

      const dealNewRound = () => {
        if (deck.length > 0) {
          const { p1Hand, p2Hand, table, updatedDeck } = dealHands(deck);
          setPlayer1Hand(p1Hand);
          setPlayer2Hand(p2Hand);
          setDeck(updatedDeck);
          setIsRoundOver(false);
          setMessage(`Round ${round + 1} - Player ${currentPlayer}'s turn`);
          setRound(round + 1);
        } else {
          handleGameOver();
        }
      };

      useEffect(() => {
        if (player1Hand.length === 0 && player2Hand.length === 0 && gamePhase === 'play') {
          setIsRoundOver(true);
          setMessage("Round Over - Dealing New Cards");
        }
      }, [player1Hand, player2Hand, gamePhase]);

      useEffect(() => {
        if (isRoundOver) {
          dealNewRound();
          setIsRoundOver(false);
        }
      }, [isRoundOver]);

      return (
        <div className="App">
          <h1>Omlongo</h1>
          {gamePhase === 'initialDeal' && (
            <button onClick={initializeDeal}>Deal Initial Cards</button>
          )}

          {gamePhase === 'play' && (
            <div className="game-board">
              <div className="player-area">
                <h2>Player 1</h2>
                <div className="player-info">
                  <div className="score">Score: {player1Score}</div>
                  <div>Round: {round}</div>
                  <div className="hand">
                    {player1Hand.map((card, index) => renderCard(card, index, 'player'))}
                  </div>
                </div>
              </div>

              <div className="table-area">
                <h2>Table</h2>
                <div className="table-cards">
                  {tableCards.map((card, index) => renderCard(card, index, 'table'))}
                </div>
              </div>

              <div className="player-area">
                <h2>Player 2</h2>
                <div className="player-info">
                  <div className="score">Score: {player2Score}</div>
                  <div>Round: {round}</div>
                  <div className="hand">
                    {player2Hand.map((card, index) => renderCard(card, index, 'player'))}
                  </div>
                </div>
              </div>
              <p>{message}</p>
              <div className="actions">
                {selectedCard && <p>Selected card: {selectedCard.rank} {selectedCard.suit}</p>}
                <button onClick={playTrail} disabled={!selectedCard || hasPlayedCard}>Trail</button>
                <button onClick={playCapture} disabled={!selectedCard || selectedTableCards.length === 0 || hasPlayedCard}>Capture</button>
                <button onClick={playBuild} disabled={!selectedCard || selectedTableCards.length === 0 || hasPlayedCard}>Build</button>
              </div>
              <button onClick={handleGameOver}>Game Over</button>
            </div>
          )}

          {gamePhase === 'gameOver' && (
            <div>
              <h2>Game Over!</h2>
              <p>Player 1 Score: {player1Score}</p>
              <p>Player 2 Score: {player2Score}</p>
              {player1Score > player2Score ? <p>Player 1 Wins!</p> : <p>Player 2 Wins!</p>}
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
        </div>
      );
    }

    export default App;
