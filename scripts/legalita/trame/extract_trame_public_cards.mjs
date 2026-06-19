import path from "node:path";
import { readCsv, trameDataDir, writeText } from "./trame_utils.mjs";

const cardsFile = path.join(trameDataDir, "public_cards", "trame_public_cards.csv");
const outputFile = path.join(trameDataDir, "public_cards", "trame_public_cards.public.json");

const { records } = await readCsv(cardsFile);
const allowedStatus = new Set(["approved", "published"]);
const allowedPriority = new Set(["high", "medium"]);

const publicCards = records.filter((card) => allowedStatus.has(card.publication_status) && allowedPriority.has(card.editorial_priority));

await writeText(
  outputFile,
  `${JSON.stringify({ generated_from: "data/legalita/trame/public_cards/trame_public_cards.csv", public_cards_count: publicCards.length, cards: publicCards }, null, 2)}\n`
);

console.log(`Schede pubbliche esportate: ${publicCards.length}.`);
