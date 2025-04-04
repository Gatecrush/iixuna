export const isValidCapture = (selectedCard, selectedTableCards) => {
      if (!selectedCard || !selectedTableCards || selectedTableCards.length === 0) {
        return false;
      }

      const cardValue = selectedCard.value;

      // Check for double capture: all selected table cards have the same value as the selected card
      if (selectedTableCards.every(tableCard => tableCard.value === cardValue)) {
        return true;
      }

      // Generate all possible combinations of table cards
      for (let i = 0; i < (1 << selectedTableCards.length); i++) {
        const combination = [];
        let sum = 0;

        for (let j = 0; j < selectedTableCards.length; j++) {
          if ((i >> j) & 1) {
            combination.push(selectedTableCards[j]);
            sum += selectedTableCards[j].value;
          }
        }

        // If the sum of the combination equals the card value, it's a valid capture
        if (sum === cardValue && combination.length > 0) {
          return true;
        }
      }

      return false;
    };
