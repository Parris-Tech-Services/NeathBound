export const locations = {
  "lantern-quay": {
    name: "Lantern Quay",
    region: "The Lower City",
    subtitle: "Where the tide carries messages in sealed bottles.",
    atmosphere: "Wet brass, coal smoke, and a bell that rings beneath the water.",
    stories: ["bell-under-water", "cartographer-at-dusk", "tea-for-the-tide"]
  },
  "velvet-market": {
    name: "The Velvet Market",
    region: "The Lower City",
    subtitle: "A bazaar for memories, rumours, and perfectly ordinary knives.",
    atmosphere: "Every stall has a curtain. Every curtain has a shadow behind it.",
    stories: ["borrowed-face", "red-thread", "market-gossip"]
  },
  "hollow-archive": {
    name: "The Hollow Archive",
    region: "The Lower City",
    subtitle: "A library where the books remember who borrowed them.",
    atmosphere: "Dust hangs in the air like a second, slower snowfall.",
    stories: ["index-of-lost-things", "the-quiet-librarian", "catalogue-the-dark"]
  },
  "clockwork-gardens": {
    name: "The Clockwork Gardens",
    region: "The High Galleries",
    subtitle: "A greenhouse where the flowers keep appointments.",
    atmosphere: "Brass leaves click together in the warm, artificial wind.",
    stories: ["garden-appointment", "borrowed-sunlight"]
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
  },
  "tea-for-the-tide": {
    title: "Tea for the Tide",
    kicker: "A courtesy to the current",
    text: "The tide has come in carrying a porcelain cup. A dockworker asks whether you will pour it back into the sea, or drink what the sea has prepared.",
    tags: ["opportunity"],
    choices: [
      { id: "pour", label: "Pour the tea into the tide", success: "The water settles. The dockworker gives you a name to use at the market.", reward: { acquaintance: "dockworker", quality: ["poise", 1] }, target: "lantern-quay" },
      { id: "drink", label: "Drink the impossible tea", success: "You remember a shore that has never existed.", failure: "The cup tastes of every promise you have broken.", challenge: { stat: "nerve", difficulty: 5 }, reward: { item: "tide-cup", menace: ["dread", 1] }, target: "hollow-archive" }
    ]
  },
  "market-gossip": {
    title: "Market Gossip",
    kicker: "A rumour with clean shoes",
    text: "Three merchants are whispering about a door that only opens for people who have been seen in the wrong place. They notice you listening.",
    tags: ["opportunity"],
    choices: [
      { id: "trade-rumour", label: "Trade a rumour of your own", success: "The merchants accept the exchange and point you toward the Gardens.", reward: { echoes: 7, unlock: "clockwork-gardens", menace: ["suspicion", 1] }, target: "clockwork-gardens" },
      { id: "leave", label: "Leave before they learn your name", success: "You leave with your name intact and your pockets lighter by one secret.", reward: { quality: ["shadow", 1] }, target: "velvet-market" }
    ]
  },
  "catalogue-the-dark": {
    title: "Catalogue the Dark",
    kicker: "An unpaid scholarly errand",
    text: "A shelf has been filled with darkness instead of books. The archive will pay you in echoes if you assign each patch a proper title.",
    challenge: { stat: "insight", difficulty: 7 },
    choices: [
      { id: "catalogue", label: "Give the darkness its titles", success: "The shelf becomes legible. The archive records your name with a respectful error.", failure: "The darkness gives you a title instead.", reward: { echoes: 15, item: "ink-of-absence" }, target: "hollow-archive" },
      { id: "close-shelf", label: "Close the shelf", success: "Some knowledge is safer when it remains unindexed.", reward: { menace: ["suspicion", -1] }, target: "lantern-quay" }
    ]
  },
  "garden-appointment": {
    title: "The Garden Appointment",
    kicker: "A flower expects you",
    text: "A clockwork flower has scheduled a meeting for you at the far end of the glasshouse. It has sent three reminders and one threat.",
    requirements: { item: "tide-cup" },
    challenge: { stat: "poise", difficulty: 6 },
    choices: [
      { id: "attend", label: "Attend the appointment", success: "The flower offers a seed that remembers the sun.", failure: "You arrive late. The flower makes a note of it.", reward: { item: "sun-seed", quality: ["poise", 1] }, target: "clockwork-gardens" },
      { id: "apologise", label: "Send an apology by moth", success: "The flower accepts. For now.", reward: { menace: ["scandal", -1] }, target: "velvet-market" }
    ]
  },
  "borrowed-sunlight": {
    title: "Borrowed Sunlight",
    kicker: "A dangerous luxury",
    text: "A glass jar contains a thumb-sized sun. The gardener offers it to you for one night, provided you promise to return the darkness it displaces.",
    tags: ["opportunity"],
    choices: [
      { id: "borrow", label: "Borrow the small sun", success: "The city looks almost kind in its light.", reward: { item: "small-sun", echoes: 9, menace: ["dread", 1] }, target: "lantern-quay" },
      { id: "refuse-sun", label: "Refuse the bargain", success: "The gardener approves of your caution.", reward: { quality: ["nerve", 1] }, target: "clockwork-gardens" }
    ]
  }
};
