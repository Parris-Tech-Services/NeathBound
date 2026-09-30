export const locations = {
  "lantern-quay": {
    name: "Lantern Quay",
    subtitle: "Where the tide carries messages in sealed bottles.",
    atmosphere: "Wet brass, coal smoke, and a bell that rings beneath the water.",
    stories: ["bell-under-water", "cartographer-at-dusk"]
  },
  "velvet-market": {
    name: "The Velvet Market",
    subtitle: "A bazaar for memories, rumours, and perfectly ordinary knives.",
    atmosphere: "Every stall has a curtain. Every curtain has a shadow behind it.",
    stories: ["borrowed-face", "red-thread"]
  },
  "hollow-archive": {
    name: "The Hollow Archive",
    subtitle: "A library where the books remember who borrowed them.",
    atmosphere: "Dust hangs in the air like a second, slower snowfall.",
    stories: ["index-of-lost-things", "the-quiet-librarian"]
  }
};

export const stories = {
  "bell-under-water": {
    title: "The Bell Under Water",
    kicker: "A sound from below",
    text: "At low tide, the quay reveals a stairway descending into black water. A bell tolls somewhere beneath the last step. The brass key in your pocket warms.",
    challenge: { stat: "nerve", difficulty: 5 },
    choices: [
      { id: "descend", label: "Descend toward the bell", success: "You find a submerged door and unlock it. Something on the other side learns your name.", failure: "The water closes over your head. You return with a pocketful of black sand.", reward: { echoes: 8, item: "black-sand" }, target: "hollow-archive" },
      { id: "listen", label: "Listen for the pattern", success: "The bell's rhythm maps a route through the city.", failure: "You hear only your own heartbeat, which is embarrassing but useful.", reward: { quality: ["insight", 1] }, target: "lantern-quay" }
    ]
  },
  "cartographer-at-dusk": {
    title: "The Cartographer at Dusk",
    kicker: "A map with an appetite",
    text: "A one-eyed cartographer offers you a map that redraws itself whenever you blink. She wants a true name in exchange for the eastern road.",
    choices: [
      { id: "trade", label: "Offer the name you were given", success: "The map accepts the name and opens a red road to the market.", failure: "The map laughs in your handwriting.", reward: { echoes: 4 }, target: "velvet-market" },
      { id: "decline", label: "Keep your name", success: "The cartographer nods. She marks a safer route in invisible ink.", reward: { quality: ["poise", 1] }, target: "lantern-quay" }
    ]
  },
  "borrowed-face": {
    title: "A Borrowed Face",
    kicker: "The tailor's invitation",
    text: "A tailor has stitched a face from moonlit silk. It resembles you, but happier. Wearing it would open every door in the market—and close one behind you.",
    challenge: { stat: "poise", difficulty: 4 },
    choices: [
      { id: "wear", label: "Wear the borrowed face", success: "The market parts like grass. You leave with a silver thimble and a new rumour about yourself.", failure: "The face slips. The tailor charges you for the embarrassment.", reward: { item: "silver-thimble", echoes: 6 }, target: "velvet-market" },
      { id: "study", label: "Study the stitching", success: "You learn how appearances are fastened here.", reward: { quality: ["insight", 1] }, target: "hollow-archive" }
    ]
  },
  "red-thread": {
    title: "The Red Thread",
    kicker: "A bargain in three knots",
    text: "A child in a red coat asks you to follow a thread through the market. She promises it leads to whatever you have misplaced.",
    choices: [
      { id: "follow", label: "Follow the thread", success: "It leads to a locked archive door and a useful key.", reward: { item: "archive-key" }, target: "hollow-archive" },
      { id: "cut", label: "Cut the thread", success: "The market exhales. You keep the loose end; it may be useful.", reward: { echoes: 10 }, target: "velvet-market" }
    ]
  },
  "index-of-lost-things": {
    title: "The Index of Lost Things",
    kicker: "A volume that knows you",
    text: "The archive's index opens to a page describing the thing you miss most. The entry is written in ink that is still wet.",
    challenge: { stat: "insight", difficulty: 6 },
    choices: [
      { id: "read", label: "Read the full entry", success: "The archive gives you a memory, sharpened into a tool.", failure: "The words rearrange into a recipe for regret.", reward: { item: "bright-memory", quality: ["insight", 1] }, target: "hollow-archive" },
      { id: "close", label: "Close the book gently", success: "The librarian smiles. Some doors are safer when left named.", reward: { quality: ["poise", 1] }, target: "lantern-quay" }
    ]
  },
  "the-quiet-librarian": {
    title: "The Quiet Librarian",
    kicker: "A question without a mouth",
    text: "The librarian points to three shelves: what you were, what you are, and what the city expects you to become. Only one shelf is dusty.",
    choices: [
      { id: "dusty", label: "Choose the dusty shelf", success: "You find a route back to the quay and a page with your handwriting.", reward: { echoes: 12, item: "unfinished-page" }, target: "lantern-quay" },
      { id: "future", label: "Choose the expected shelf", success: "The city applauds politely. You gain a title you did not request.", reward: { quality: ["poise", 1], echoes: 3 }, target: "velvet-market" }
    ]
  }
};
