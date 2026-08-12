const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const suits = ["spades", "clubs", "hearts", "diamonds"];
const powerFor = (rank, suit) => {
    if (rank === "7" || rank === "8")
        return "peek-self";
    if (rank === "9" || rank === "10")
        return "peek-opponent";
    if (rank === "J" || rank === "Q")
        return "blind-swap";
    if (rank === "K")
        return "king";
    return undefined;
};
const valueFor = (rank, suit) => {
    if (rank === "A")
        return 1;
    if (rank === "J")
        return 11;
    if (rank === "Q")
        return 12;
    if (rank === "K") {
        return suit === "hearts" || suit === "diamonds" ? -1 : 13;
    }
    return Number(rank);
};
export function createDeck() {
    const deck = [];
    let id = 0;
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({
                id: `card-${id++}`,
                rank,
                suit,
                value: valueFor(rank, suit),
                power: powerFor(rank, suit),
            });
        }
    }
    deck.push({ id: `card-${id++}`, rank: "JK", suit: "joker", value: 0 });
    deck.push({ id: `card-${id++}`, rank: "JK", suit: "joker", value: 0 });
    return deck;
}
export function shuffle(items, random = Math.random) {
    const clone = [...items];
    for (let i = clone.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}
