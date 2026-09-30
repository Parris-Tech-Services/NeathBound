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
    requirements: [],
    choices: [
      {
        id: "descend",
        label: "Descend toward the bell",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 5 },
        success: "You find a submerged door and unlock it. Something on the other side learns your name.",
        failure: "The water closes over your head. You return with a pocketful of black sand.",
        successEffects: [
          { type: "echoes", amount: 8 },
          { type: "item", id: "black-sand", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [
          { type: "item", id: "black-sand", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ]
      },
      {
        id: "listen",
        label: "Listen for the pattern",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 5 },
        success: "The bell's rhythm maps a route through the city.",
        failure: "You hear only your own heartbeat, which is embarrassing but useful.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: [{ type: "location", id: "lantern-quay" }]
      }
    ]
  },
  "cartographer-at-dusk": {
    title: "The Cartographer at Dusk",
    kicker: "A map with an appetite",
    text: "A one-eyed cartographer offers you a map that redraws itself whenever you blink. She wants a true name in exchange for the eastern road.",
    requirements: [],
    choices: [
      {
        id: "trade",
        label: "Offer the name you were given",
        requirements: [],
        success: "The map accepts the name and opens a red road to the market.",
        successEffects: [
          { type: "echoes", amount: 4 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      },
      {
        id: "decline",
        label: "Keep your name",
        requirements: [],
        success: "The cartographer nods. She marks a safer route in invisible ink.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      }
    ]
  },
  "borrowed-face": {
    title: "A Borrowed Face",
    kicker: "The tailor's invitation",
    text: "A tailor has stitched a face from moonlit silk. It resembles you, but happier. Wearing it would open every door in the market—and close one behind you.",
    requirements: [],
    choices: [
      {
        id: "wear",
        label: "Wear the borrowed face",
        requirements: [],
        challenge: { quality: "poise", difficulty: 4 },
        success: "The market parts like grass. You leave with a silver thimble and a new rumour about yourself.",
        failure: "The face slips. The tailor charges you for the embarrassment.",
        successEffects: [
          { type: "item", id: "silver-thimble", amount: 1 },
          { type: "echoes", amount: 6 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: [{ type: "location", id: "velvet-market" }]
      },
      {
        id: "study",
        label: "Study the stitching",
        requirements: [],
        success: "You learn how appearances are fastened here.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: []
      }
    ]
  },
  "red-thread": {
    title: "The Red Thread",
    kicker: "A bargain in three knots",
    text: "A child in a red coat asks you to follow a thread through the market. She promises it leads to whatever you have misplaced.",
    requirements: [],
    choices: [
      {
        id: "follow",
        label: "Follow the thread",
        requirements: [],
        success: "It leads to a locked archive door and a useful key.",
        successEffects: [
          { type: "item", id: "archive-key", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: []
      },
      {
        id: "cut",
        label: "Cut the thread",
        requirements: [],
        success: "The market exhales. You keep the loose end; it may be useful.",
        successEffects: [
          { type: "echoes", amount: 10 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "index-of-lost-things": {
    title: "The Index of Lost Things",
    kicker: "A volume that knows you",
    text: "The archive's index opens to a page describing the thing you miss most. The entry is written in ink that is still wet.",
    requirements: [],
    choices: [
      {
        id: "read",
        label: "Read the full entry",
        requirements: [],
        challenge: { quality: "insight", difficulty: 6 },
        success: "The archive gives you a memory, sharpened into a tool.",
        failure: "The words rearrange into a recipe for regret.",
        successEffects: [
          { type: "item", id: "bright-memory", amount: 1 },
          { type: "quality", id: "insight", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [{ type: "location", id: "hollow-archive" }]
      },
      {
        id: "close",
        label: "Close the book gently",
        requirements: [],
        success: "The librarian smiles. Some doors are safer when left named.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-quiet-librarian": {
    title: "The Quiet Librarian",
    kicker: "A question without a mouth",
    text: "The librarian points to three shelves: what you were, what you are, and what the city expects you to become. Only one shelf is dusty.",
    requirements: [],
    choices: [
      {
        id: "dusty",
        label: "Choose the dusty shelf",
        requirements: [],
        success: "You find a route back to the quay and a page with your handwriting.",
        successEffects: [
          { type: "echoes", amount: 12 },
          { type: "item", id: "unfinished-page", amount: 1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      },
      {
        id: "future",
        label: "Choose the expected shelf",
        requirements: [],
        success: "The city applauds politely. You gain a title you did not request.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "echoes", amount: 3 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  }
};
