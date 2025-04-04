// src/modules/turns.js

    export const handleCapture = (card, targetCards, currentPlayer,
      player1Score, player2Score, tableCards, lastCapturer,
      player1Pile, player2Pile, setPlayer1Pile, setPlayer2Pile) => {

      // Initialize return values
      let newP1Score = player1Score;
      let newP2Score = player2Score;
      let newTableCards = [...tableCards];
      let newLastCapturer = lastCapturer;
      let sweep = false;
      let newMessage = '';

      // Validate target cards
      if (!targetCards || targetCards.length === 0) {
        newMessage = 'Invalid capture: No target cards selected.';
        return { newP1Score, newP2Score, newTableCards, newLastCapturer, sweep, newMessage };
      }

      // Calculate total value of target cards
      const totalValue = targetCards.reduce((acc, c) => acc + c.value, 0);

      // Check if the total value matches the card's value
      if (totalValue !== card.value) {
        newMessage = 'Invalid capture: Target cards value does not match played card value.';
        return { newP1Score, newP2Score, newTableCards, newLastCapturer, sweep, newMessage };
      }

      // Update scores and table cards
      if (currentPlayer === 1) {
        newP1Score += targetCards.length + 1; // +1 for the card played
      } else {
        newP2Score += targetCards.length + 1; // +1 for the card played
      }

      // Remove captured cards from the table
      newTableCards = tableCards.filter((c) => !targetCards.includes(c));

      // Check for sweep
      if (newTableCards.length === 0) {
        sweep = true;
        newMessage = 'Sweep!';
        if (currentPlayer === 1) {
          newP1Score += 1;
        } else {
          newP2Score += 1;
        }
      }

      // Update last capturer
      newLastCapturer = currentPlayer;

      return {
        newP1Score,
        newP2Score,
        newTableCards,
        newLastCapturer,
        sweep,
        newMessage,
      };
    };

    export const handleBuild = (card, buildCards, currentPlayer, player1Score, player2Score, tableCards) => {
      let newTableCards = [...tableCards];
      return { newTableCards };
    };
