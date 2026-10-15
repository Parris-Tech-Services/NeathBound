// Player-facing chapter guidance lives separately from the prose so quests stay
// legible even when the player returns after a long break. No save migration needed.
export const CITY_ROUTES = [
  { id: "the-lair", hint: "Your starting chamber; reached through the opening story." },
  { id: "lantern-quay", hint: "Escape the Lair. Investigate the bell stamped into the door." },
  { id: "hollow-archive", hint: "Follow the Bell Under Water at Lantern Quay." },
  { id: "velvet-market", hint: "Meet the Cartographer at Dusk at Lantern Quay, or ask the Quiet Librarian." },
  { id: "clockwork-gardens", hint: "Trade a rumour in the Velvet Market, or wash the salt from the cartographer's map." },
  { id: "glass-observatory", hint: "Recover your own Archive entry and follow The Margin Note." },
  { id: "ashrail-station", hint: "From Lantern Quay, choose Three Roads Out of Lantern Quay and ride the north line." },
  { id: "cinder-ward", hint: "From Lantern Quay, choose Three Roads Out of Lantern Quay and climb the east stair." },
  { id: "duskwater", hint: "Accept the Gloomwing commission at Lantern Quay and follow its first lead." },
  { id: "black-spire", hint: "Follow the Gloomwing hunt through Duskwater to the old outer door." },
  { id: "bureau-hall", hint: "Continue the Gloomwing hunt through Black Spire to reach the central Bureau." },
  { id: "registry-of-hours", hint: "At Ashrail Station, investigate The Cancelled Platform to unlock the Registry." }
];

export function getQuestGuide(state) {
  const flags = state.flags ?? {};
  const hasPage = (state.items?.["unfinished-page"] ?? 0) > 0;
  const known = new Set(state.unlockedLocations ?? []);
  const make = (chapter, title, knownFact, objective, nextLocation, storyId, step) =>
    ({ chapter, title, knownFact, objective, nextLocation, storyId, step, total: chapter.startsWith("Chapter Two") ? 4 : 7 });
  if (state.locationId === "the-lair") {
    return make("Prologue", "The Missing Name", "The Lair's registry lists another person in your place. A bell is stamped into the lock.", "Escape through A Way Out and follow the clue to Lantern Quay.", "the-lair", "lair-escape", 1);
  }
  // Both failed approaches still reveal the Archive and move the player there.
  const bellInvestigated=flags["story-complete:bell-under-water"] || flags["bell-under-water:descend"] || flags["bell-under-water:listen"];
  if (!bellInvestigated) {
    return make("Chapter One", "Find the bell", "Your cell had the wrong name on its records. The escape key bears the image of a bell.", "At Lantern Quay, investigate The Bell Under Water to find where your registration was copied.", "lantern-quay", "bell-under-water", 2);
  }
  if (!flags["story-complete:index-of-lost-things"]) {
    return make("Chapter One", "Find the altered record", "The bell led you to an old passage associated with the city's record keepers.", "At the Hollow Archive, investigate The Index of Lost Things for evidence of your original identity.", "hollow-archive", "index-of-lost-things", 3);
  }
  if (!flags["read-own-entry"]) {
    return make("Chapter One", "Recover the missing page", "The Index shows someone deliberately changed your official record. A final line is missing.",
      hasPage ? "You have the torn page. Go to the Hollow Archive and choose an ending in Finish the Page." : "At the Hollow Archive, choose The Page They Overlooked (or ask the Quiet Librarian) to recover the torn page.",
      "hollow-archive", hasPage ? "finish-the-page" : "archive-paper-trail", 4);
  }
  if (!known.has("glass-observatory") && state.locationId !== "glass-observatory") {
    return make("Chapter One", "Follow the shelf-mark", "Your recovered page points to a skyward annex. Whether you kept the finding private or joined the Index matters to the archivists.", "At the Hollow Archive, choose Follow the shelf mark in The Margin Note to reach the Glass Observatory.", "hollow-archive", "the-margin-note", 5);
  }
  if (!flags["found-the-far-crack"]) {
    return make("Chapter One", "Investigate the stone sky", "The shelf-mark took you to the Glass Observatory, where someone studied the same impossible light when your records changed.", "At the Glass Observatory, use the lens in Survey the Stone Sky to discover the uncharted crack.", "glass-observatory", "survey-the-stone-sky", 6);
  }
  if (!flags["far-crack-answered"]) {
    return make("Chapter One", "Choose what to do with the evidence", "The Observatory's uncharted crack holds light that isn't from any city lamp.", "At the Glass Observatory, explore The Far Crack. You may document the evidence, or signal it if you have a small sun.", "glass-observatory", "the-far-crack", 7);
  }
  if (!flags["chapter-two:ticket"]) {
    return make("Chapter Two", "The cancelled journey",
      "The far crack was witnessed when your name vanished. Someone also cancelled a railway platform at the same moment.",
      "At Lantern Quay, choose Three Roads Out of Lantern Quay and take the north line. At Ashrail Station, investigate The Cancelled Platform.",
      known.has("ashrail-station") ? "ashrail-station" : "lantern-quay",
      known.has("ashrail-station") ? "ashrail-cancelled-platform" : "quay-roads", 1);
  }
  if (!flags["chapter-two:evidence"]) {
    return make("Chapter Two", "The Thirteenth Correction",
      "The cancelled ticket identifies the Registry of Hours. The Observatory charts show why the thirteenth bell matters.",
      "Travel to the Registry of Hours using the city map and choose The Thirteenth Correction. You can also visit Cinder Ward to meet families whose records were removed.",
      "registry-of-hours", "registry-thirteenth-correction", 2);
  }
  if (!flags["chapter-two:complete"]) {
    return make("Chapter Two", "What shall the city remember?",
      "A clerk erased families' names to hide them from the hungry presence beyond the stone sky. Now you have the evidence.",
      "At the Registry of Hours, choose What Shall the City Remember? Your decision is permanent in this playthrough.",
      "registry-of-hours", "registry-last-decision", 3);
  }
  if (!flags["story-complete:registry-afterword"]) {
    return make("Chapter Two", "The clerk's last note",
      "Your choice changed who the city recognises, and who is hidden. The Registry still has a message for you.",
      "At the Registry of Hours, read The Clerk's Last Note to finish Chapter Two.",
      "registry-of-hours", "registry-afterword", 4);
  }
  return make("Chapter Two: complete", "Your choice remains",
    flags["chapter-two:truth-published"] ? "The deleted names are public again, but their bearers may now be exposed." : "You hid the names in a private ledger, protecting lives while leaving people unrecognised.",
    "Explore Ashrail Station, Cinder Ward, the Registry and earlier districts. Chapter Three remains unwritten.",
    state.locationId, null, 4);
}
