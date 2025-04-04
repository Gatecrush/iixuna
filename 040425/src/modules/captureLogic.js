// src/modules/captureLogic.js
    import { CasinoGameEngine } from './gameLogic';

    export class CaptureValidator {
      static getValidCaptures(playedCard, tableCards, playerHand) {
        const captures = [];
        const playedValue = CasinoGameEngine.cardValues[playedCard.rank];

        // Direct capture
        const directMatches = tableCards.filter(c =>
          CasinoGameEngine.cardValues[c.rank] === playedValue
        );

        // Combination capture
        const combinationCaptures = this.findCombinations(tableCards, playedValue);

        // Build capture
        const buildCaptures = this.checkBuildCaptures(playedValue);

        return [...directMatches, ...combinationCaptures, ...buildCaptures];
      }

      static findCombinations(tableCards, target) {
        const combinations = [];
        const n = tableCards.length;

        for (let i = 0; i < (1 << n); i++) {
          const combination = [];
          let sum = 0;

          for (let j = 0; j < n; j++) {
            if ((i >> j) & 1) {
              combination.push(tableCards[j]);
              sum += CasinoGameEngine.cardValues[tableCards[j].rank];
            }
          }

          if (sum === target && combination.length > 0) {
            combinations.push(combination);
          }
        }

        return combinations;
      }

      static checkBuildCaptures(playedValue) {
        const buildCaptures = [];
        // Implement build capture logic here
        return buildCaptures;
      }
    }
