// src/modules/buildLogic.js

    export const isValidBuild = (
      selectedCard,        // Card played from hand (optional)
      selectedTableCards,  // Array of table cards to build with
      playerHand,          // Player's current hand (including selectedCard)
      existingBuilds = []  // Existing builds on the table (optional)
    ) => {
      // Basic validation
      if (!selectedTableCards?.length ||
        selectedTableCards.some(c => !c) ||
        (selectedCard && !playerHand.includes(selectedCard))) {
        return false;
      }

      // 1. Check numeric values are available
      const getNumericValue = (card) => {
        // Casino uses Ace=1, King=13 values for builds
        const values = {
          '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
          'J': 11, 'Q': 12, 'K': 13, 'A': 1  // Fixed Ace value for builds
        };
        return values[card.rank]; // Use card.rank instead of card.value
      };

      // 2. Calculate build total
      const tableSum = selectedTableCards.reduce((sum, card) => sum + getNumericValue(card), 0);
      const buildTotal = selectedCard ?
        getNumericValue(selectedCard) + tableSum :
        tableSum;

      // 3. Check against valid build types
      const validBuildTypes = {
        // Simple build (table cards total matches capture card)
        simple: () => playerHand.some(card =>
          card !== selectedCard &&
          getNumericValue(card) === buildTotal
        ),

        // Multi-build (multiple capture options)
        multi: () => {
          const possibleTotals = new Set([
            buildTotal,
            ...selectedTableCards.map(getNumericValue)
          ]);

          return playerHand.some(card =>
            card !== selectedCard &&
            possibleTotals.has(getNumericValue(card))
          );
        },

        // Build extension (adding to existing builds)
        extension: () => existingBuilds.some(build => {
          const combinedTotal = build.total + buildTotal;
          return playerHand.some(c =>
            c !== selectedCard &&
            getNumericValue(c) === combinedTotal
          );
        })
      };

      // 4. Check build ownership and validity
      const isNewBuildValid = validBuildTypes.simple() || validBuildTypes.multi();
      const isExtensionValid = validBuildTypes.extension();

      // 5. Final validation
      const hasCaptureCard = isNewBuildValid || isExtensionValid;
      const hasCardsLeft = selectedCard ?
        playerHand.length > 1 :  // After playing build card
        playerHand.length >= 1;  // When using only table cards

      // 6. Check build components aren't in existing builds
      const allTableCardsAvailable = selectedTableCards.every(card =>
        !existingBuilds.some(build =>
          build.cards.includes(card)
        ));

      return hasCaptureCard && hasCardsLeft && allTableCardsAvailable;
    };
