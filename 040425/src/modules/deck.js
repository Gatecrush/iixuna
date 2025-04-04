// deck.js
    export const createDeck = () => {
      const suits = ["C", "D", "H", "S"];
      const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
      const deck = [];

      for (let suit of suits) {
        for (let rank of ranks) {
          deck.push({ suit, rank, value: getValue(rank), suitRank: suit + rank });
        }
      }
      return deck;
    };

    export const shuffleDeck = (deck) => {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    };

    export const getValue = (rank) => {
      if (["J", "Q", "K"].includes(rank)) return 10;
      if (rank === "A") return 1;
      return parseInt(rank);
    };
