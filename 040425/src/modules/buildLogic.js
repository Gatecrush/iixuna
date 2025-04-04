// src/modules/buildLogic.js

    export const isValidBuild = (selectedCard, selectedTableCards, playerHand) => {
      if (!selectedCard || !selectedTableCards || selectedTableCards.length === 0) {
        return false;
      }

      const cardValue = selectedCard.value;
      const totalValue = selectedTableCards.reduce((acc, card) => acc + card.value, 0);

      return cardValue === totalValue;
    };
