export const locations = {
  "lantern-quay": {
    name: "Lantern Quay",
    region: "The Lower City",
    subtitle: "Where the tide carries messages in sealed bottles.",
    atmosphere: "Wet brass, coal smoke, and a bell that rings beneath the water.",
    stories: ["bell-under-water", "cartographer-at-dusk", "tea-for-the-tide", "salt-on-the-map", "return-the-darkness", "the-cartographer-returns", "the-submerged-door"]
  },
  "velvet-market": {
    name: "The Velvet Market",
    region: "The Lower City",
    subtitle: "A bazaar for memories, rumours, and perfectly ordinary knives.",
    atmosphere: "Every stall has a curtain. Every curtain has a shadow behind it.",
    stories: ["borrowed-face", "red-thread", "market-gossip", "the-sand-reader", "unwritten-ink", "the-debt-collector", "the-loose-end"]
  },
  "hollow-archive": {
    name: "The Hollow Archive",
    region: "The Lower City",
    subtitle: "A library where the books remember who borrowed them.",
    atmosphere: "Dust hangs in the air like a second, slower snowfall.",
    stories: ["index-of-lost-things", "the-quiet-librarian", "catalogue-the-dark", "the-locked-stacks", "finish-the-page", "an-entry-in-the-index", "the-margin-note"]
  },
  "clockwork-gardens": {
    name: "The Clockwork Gardens",
    region: "The High Galleries",
    subtitle: "A greenhouse where the flowers keep appointments.",
    atmosphere: "Brass leaves click together in the warm, artificial wind.",
    stories: ["garden-appointment", "borrowed-sunlight", "plant-the-sun-seed", "the-seedling-dawn", "the-memory-graft", "the-gardeners-thanks"]
  },
  "glass-observatory": {
    name: "The Glass Observatory",
    region: "The High Galleries",
    subtitle: "Where patient astronomers study a sky made of stone.",
    atmosphere: "Lenses the size of ponds, chalk star-charts, and the slow drip of the ceiling overhead.",
    stories: ["survey-the-stone-sky", "the-lamp-that-fell-upward", "the-far-crack"]
  }
};

export const stories = {
  "bell-under-water": {
    once: true,
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
    once: true,
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
    once: true,
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
    once: true,
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
          { type: "item", id: "red-thread-end", amount: 1 },
          { type: "echoes", amount: 4 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "index-of-lost-things": {
    once: true,
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
    once: true,
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
  },
  "tea-for-the-tide": {
    title: "Tea for the Tide",
    kicker: "A courtesy to the current",
    text: "The tide has come in carrying a porcelain cup. A dockworker asks whether you will pour it back into the sea, or drink what the sea has prepared.",
    tags: ["opportunity"],
    choices: [
      { id: "pour", label: "Pour the tea into the tide", requirements: [], success: "The water settles. The dockworker gives you a name to use at the market.", successEffects: [{ type: "flag", id: "acquaintance-dockworker", value: true }, { type: "quality", id: "poise", amount: 1 }, { type: "location", id: "lantern-quay" }], failureEffects: [] },
      { id: "drink", label: "Drink the impossible tea", requirements: [], success: "You remember a shore that has never existed.", failure: "The cup tastes of every promise you have broken.", challenge: { quality: "nerve", difficulty: 5 }, successEffects: [{ type: "item", id: "tide-cup", amount: 1 }, { type: "menace", id: "dread", amount: 1 }, { type: "location", id: "hollow-archive" }], failureEffects: [{ type: "menace", id: "dread", amount: 1 }, { type: "location", id: "hollow-archive" }] }
    ]
  },
  "market-gossip": {
    title: "Market Gossip",
    kicker: "A rumour with clean shoes",
    text: "Three merchants are whispering about a door that only opens for people who have been seen in the wrong place. They notice you listening.",
    tags: ["opportunity", "repeatable"],
    choices: [
      {
        id: "trade-rumour",
        label: "Trade a rumour of your own",
        success: "The merchants accept the exchange and point you toward the Gardens.",
        successEffects: [
          { type: "echoes", amount: 4 },
          { type: "unlock-location", id: "clockwork-gardens" },
          { type: "menace", id: "suspicion", amount: 1 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      },
      {
        id: "leave",
        label: "Leave before they learn your name",
        success: "You leave with your name intact and your pockets lighter by one secret.",
        successEffects: [
          { type: "quality", id: "shadow", amount: 1 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "catalogue-the-dark": {
    title: "Catalogue the Dark",
    kicker: "An unpaid scholarly errand",
    text: "A shelf has been filled with darkness instead of books. The archive will pay you in echoes if you assign each patch a proper title.",
    challenge: { quality: "insight", difficulty: 7 },
    choices: [
      {
        id: "catalogue",
        label: "Give the darkness its titles",
        success: "The shelf becomes legible. The archive records your name with a respectful error.",
        failure: "The darkness gives you a title instead.",
        successEffects: [
          { type: "echoes", amount: 15 },
          { type: "item", id: "ink-of-absence", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [
          { type: "menace", id: "dread", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ]
      },
      {
        id: "close-shelf",
        label: "Close the shelf",
        challenge: false,
        success: "Some knowledge is safer when it remains unindexed.",
        successEffects: [
          { type: "menace", id: "suspicion", amount: -1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      }
    ]
  },
  "garden-appointment": {
    once: true,
    title: "The Garden Appointment",
    kicker: "A flower expects you",
    text: "A clockwork flower has scheduled a meeting for you at the far end of the glasshouse. It has sent three reminders and one threat.",
    requirements: [{ type: "item", id: "tide-cup", op: ">=", value: 1 }],
    challenge: { quality: "poise", difficulty: 6 },
    choices: [
      {
        id: "attend",
        label: "Attend the appointment",
        success: "The flower offers a seed that remembers the sun.",
        failure: "You arrive late. The flower makes a note of it.",
        successEffects: [
          { type: "item", id: "sun-seed", amount: 1 },
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: [
          { type: "menace", id: "scandal", amount: 1 },
          { type: "location", id: "clockwork-gardens" }
        ]
      },
      {
        id: "apologise",
        label: "Send an apology by moth",
        challenge: false,
        success: "The flower accepts. For now.",
        successEffects: [
          { type: "menace", id: "scandal", amount: -1 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "borrowed-sunlight": {
    once: true,
    title: "Borrowed Sunlight",
    kicker: "A dangerous luxury",
    text: "A glass jar contains a thumb-sized sun. The gardener offers it to you for one night, provided you promise to return the darkness it displaces.",
    tags: ["opportunity"],
    choices: [
      {
        id: "borrow",
        label: "Borrow the small sun",
        success: "The city looks almost kind in its light.",
        successEffects: [
          { type: "item", id: "small-sun", amount: 1 },
          { type: "echoes", amount: 9 },
          { type: "menace", id: "dread", amount: 1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      },
      {
        id: "refuse-sun",
        label: "Refuse the bargain",
        success: "The gardener approves of your caution.",
        successEffects: [
          { type: "quality", id: "nerve", amount: 1 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      }
    ]
  },
  "salt-on-the-map": {
    title: "Salt on the Map",
    kicker: "The first thing you owned",
    text: "The map you woke holding has dried stiff with salt. Where the crust is thickest, faint lines show through: a coastline that is not the quay's, and a stair climbing toward warm glass.",
    requirements: [
      { type: "item", id: "salted-map", op: ">=", value: 1 },
      { type: "flag", id: "salt-on-the-map:soak", op: "!=", value: true }
    ],
    choices: [
      {
        id: "soak",
        label: "Soak the map in the tide",
        requirements: [],
        success: "The salt lifts away in a pale cloud. Underneath, a route has been waiting: up through the lamp-stairs to the Clockwork Gardens. You follow it before the paper dries and forgets.",
        successEffects: [
          { type: "flag", id: "map-route-known", value: true },
          { type: "unlock-location", id: "clockwork-gardens" },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      },
      {
        id: "read-salt",
        label: "Read the salt as though it were ink",
        requirements: [],
        challenge: { quality: "insight", difficulty: 4 },
        success: "The crystals are a record of every tide the map has survived. Someone carried it a very long way to put it in your hand.",
        failure: "You read a great deal of salt. It says, consistently, salt.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 3 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: [{ type: "location", id: "lantern-quay" }]
      }
    ]
  },
  "the-sand-reader": {
    title: "The Sand Reader",
    kicker: "Fortunes from under the water",
    text: "Behind a curtain stitched with fish-scales, a woman with clouded eyes sifts sand through her fingers. She stops when you come in. \"You have been below the bell,\" she says. \"Show me what it gave you.\"",
    requirements: [{ type: "item", id: "black-sand", op: ">=", value: 1 }],
    choices: [
      {
        id: "reading",
        label: "Pour your black sand for a reading",
        requirements: [],
        challenge: { quality: "insight", difficulty: 5 },
        success: "The sand settles into the shape of a door you have not opened yet. She traces its hinges for you twice, so you will know them when you see them.",
        failure: "The sand settles into the shape of your own hand. She says that is a common fortune, and not a cheap one.",
        successEffects: [
          { type: "item", id: "black-sand", amount: -1 },
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 2 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: [
          { type: "item", id: "black-sand", amount: -1 },
          { type: "location", id: "velvet-market" }
        ]
      },
      {
        id: "sell-sand",
        label: "Sell her the sand by the pinch",
        requirements: [],
        success: "She weighs it on a scale with no pans and pays in warm coins. \"Come back when the bell has more to say.\"",
        successEffects: [
          { type: "item", id: "black-sand", amount: -1 },
          { type: "echoes", amount: 6 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-locked-stacks": {
    title: "The Locked Stacks",
    kicker: "A key finds its door",
    text: "The key from the red thread has begun to tug toward the back of the archive, where a gate of black iron guards shelves nobody admits to cataloguing. The lock is shaped like a question mark.",
    requirements: [{ type: "item", id: "archive-key", op: ">=", value: 1 }],
    choices: [
      {
        id: "unlock",
        label: "Unlock the gate and go in",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 6 },
        success: "The key turns once and stays in the lock, content. Inside, every book is a ledger of debts owed to the city. Yours is thinner than you feared. You copy out the useful parts and leave the rest unread.",
        failure: "The gate opens onto a corridor that is slightly longer each time you look down it. You retreat with the key still in your hand and the distinct feeling of having been measured.",
        successEffects: [
          { type: "item", id: "archive-key", amount: -1 },
          { type: "echoes", amount: 14 },
          { type: "quality", id: "shadow", amount: 1 },
          { type: "flag", id: "read-the-debt-ledgers", value: true },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [{ type: "location", id: "hollow-archive" }]
      },
      {
        id: "return-key",
        label: "Return the key to the child in red",
        requirements: [],
        success: "You find her in the market, winding the red thread back onto its spool. She takes the key, bows as if you have done something much larger, and tells you which stalls not to trust.",
        successEffects: [
          { type: "item", id: "archive-key", amount: -1 },
          { type: "quality", id: "poise", amount: 1 },
          { type: "echoes", amount: 4 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "finish-the-page": {
    title: "Finish the Page",
    kicker: "Your own handwriting, interrupted",
    text: "The page from the dusty shelf is written in your hand and stops mid-sentence: \"If I come back down here, I must remember to\". The ink of the last word never dried.",
    requirements: [{ type: "item", id: "unfinished-page", op: ">=", value: 1 }],
    choices: [
      {
        id: "write-ending",
        label: "Write the ending yourself",
        requirements: [],
        challenge: { quality: "insight", difficulty: 6 },
        success: "You finish the sentence without knowing what you meant, and it is exactly right. The page folds itself into your coat and stops insisting.",
        failure: "Every ending you write slides off the paper and pools at the bottom of the page. The sentence stays unfinished, and a little smug.",
        successEffects: [
          { type: "item", id: "unfinished-page", amount: -1 },
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 10 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [{ type: "location", id: "hollow-archive" }]
      },
      {
        id: "stitch-page",
        label: "Stitch the page into the index with the silver thimble",
        requirements: [{ type: "item", id: "silver-thimble", op: ">=", value: 1 }],
        success: "The thimble guides the needle for you. Once the page is bound into the Index of Lost Things, the archive treats you as one of its own entries: welcome, if slightly overdue.",
        successEffects: [
          { type: "item", id: "unfinished-page", amount: -1 },
          { type: "item", id: "silver-thimble", amount: -1 },
          { type: "quality", id: "poise", amount: 1 },
          { type: "echoes", amount: 18 },
          { type: "flag", id: "bound-into-the-index", value: true },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: []
      }
    ]
  },
  "return-the-darkness": {
    title: "Return the Darkness",
    kicker: "A promise comes due",
    text: "Wherever the small sun goes, a patch of darkness trails a few steps behind it, like a dog waiting to be called home. The gardener made you promise to give it back.",
    requirements: [{ type: "item", id: "small-sun", op: ">=", value: 1 }],
    choices: [
      {
        id: "gather",
        label: "Gather the darkness into your coat and carry it home",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 6 },
        success: "The darkness is heavier than it looks and quieter than you expect. The gardener takes back the sun, pours the dark into an empty jar, and seals it with wax the colour of your pulse.",
        failure: "Some of the darkness slips away down the lamp-stairs. The gardener takes back the sun and says nothing, which is worse.",
        successEffects: [
          { type: "item", id: "small-sun", amount: -1 },
          { type: "quality", id: "shadow", amount: 1 },
          { type: "echoes", amount: 12 },
          { type: "flag", id: "kept-the-sun-promise", value: true },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: [
          { type: "item", id: "small-sun", amount: -1 },
          { type: "location", id: "clockwork-gardens" }
        ]
      },
      {
        id: "keep-sun",
        label: "Keep the sun a little longer",
        requirements: [],
        success: "You buy candles to keep the patient dark at a polite distance. It sits outside your door each night and does not complain.",
        successEffects: [
          { type: "echoes", amount: -3 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      }
    ]
  },
  "plant-the-sun-seed": {
    title: "The Seed that Remembers the Sun",
    kicker: "A gift from a punctual flower",
    text: "The seed in your pocket is warm and faintly impatient. There is an empty bed of brass filings in the middle of the glasshouse, just its size.",
    requirements: [{ type: "item", id: "sun-seed", op: ">=", value: 1 }],
    choices: [
      {
        id: "plant",
        label: "Plant it in the brass bed",
        requirements: [{ type: "flag", id: "plant-the-sun-seed:plant", op: "!=", value: true }],
        success: "It takes root with a sound like a watch being wound. By the time you have washed your hands, it has put up a green shoot and something that is almost a sunrise.",
        successEffects: [
          { type: "item", id: "sun-seed", amount: -1 },
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      },
      {
        id: "swallow",
        label: "Swallow it and see what grows",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 7 },
        success: "For an hour you are warm all the way through, and you understand the city's clocks as if they were speaking to you.",
        failure: "It is like swallowing a lit match that is also disappointed in you. You spend the afternoon lying very still on a garden bench.",
        successEffects: [
          { type: "item", id: "sun-seed", amount: -1 },
          { type: "quality", id: "insight", amount: 2 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: [
          { type: "item", id: "sun-seed", amount: -1 },
          { type: "location", id: "clockwork-gardens" }
        ]
      }
    ]
  },
  "the-seedling-dawn": {
    title: "The Seedling Dawn",
    kicker: "Something you planted",
    text: "The seed you planted has become a sapling of copper and glass. Every few hours it blossoms into a very small morning, and the brass leaves around it turn to face it.",
    requirements: [{ type: "flag", id: "plant-the-sun-seed:plant", op: "==", value: true }],
    choices: [
      {
        id: "harvest",
        label: "Harvest one of its mornings",
        requirements: [],
        success: "You catch the morning in your cupped hands. It fits in your pocket, just about, and casts a shadow that will want returning.",
        successEffects: [
          { type: "item", id: "small-sun", amount: 1 },
          { type: "echoes", amount: 4 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      },
      {
        id: "tend",
        label: "Sit with it until it blooms",
        requirements: [],
        success: "It is a small, entirely private dawn. The gardener pretends not to watch you enjoy it.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-memory-graft": {
    title: "The Memory Graft",
    kicker: "A rose that wants to remember",
    text: "One of the brass roses has no scent at all. The gardener explains that it was never given a memory to grow from, and looks pointedly at the bright thing in your pocket.",
    requirements: [{ type: "item", id: "bright-memory", op: ">=", value: 1 }],
    choices: [
      {
        id: "graft",
        label: "Graft your bright memory onto the rose",
        requirements: [],
        challenge: { quality: "insight", difficulty: 5 },
        success: "The rose opens and smells of the day you are trying to remember. You still have the memory, somehow; it simply has company now.",
        failure: "The graft does not take. The memory comes back to you slightly bruised, and the rose goes on smelling of nothing.",
        successEffects: [
          { type: "item", id: "bright-memory", amount: -1 },
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 15 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: [{ type: "location", id: "clockwork-gardens" }]
      },
      {
        id: "gift-to-flower",
        label: "Offer it to the flower you kept waiting",
        requirements: [{ type: "flag", id: "garden-appointment:attend", op: "==", value: true }],
        success: "The clockwork flower accepts the memory, files it somewhere inside its petals, and cancels all your outstanding appointments. It is the nearest thing to forgiveness the gardens offer.",
        successEffects: [
          { type: "item", id: "bright-memory", amount: -1 },
          { type: "quality", id: "poise", amount: 2 },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      }
    ]
  },
  "unwritten-ink": {
    title: "Unwritten Ink",
    kicker: "What the dark gave you",
    text: "The ink the archive gave you writes nothing at all, but whatever it touches becomes a little harder to remember. The market has several uses for that.",
    requirements: [{ type: "item", id: "ink-of-absence", op: ">=", value: 1 }],
    choices: [
      {
        id: "blot-rumour",
        label: "Blot out a rumour about yourself",
        requirements: [],
        success: "You find the rumour chalked on the back of a stall and draw one careful line through it. By evening, nobody can say quite who it was about.",
        successEffects: [
          { type: "item", id: "ink-of-absence", amount: -1 },
          { type: "quality", id: "shadow", amount: 1 },
          { type: "echoes", amount: 3 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      },
      {
        id: "sell-ink",
        label: "Sell the ink to the tailor",
        requirements: [],
        success: "The tailor pays generously and does not say what it is for. Later you notice one of the borrowed faces on display has no name tag.",
        successEffects: [
          { type: "item", id: "ink-of-absence", amount: -1 },
          { type: "echoes", amount: 11 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-cartographer-returns": {
    title: "The Cartographer Returns",
    kicker: "She noticed what you did to the map",
    text: "The one-eyed cartographer is waiting at the top of the quay steps. \"You washed the salt off,\" she says, not quite accusing. \"Nobody washes the salt off. May I see what was underneath?\"",
    requirements: [
      { type: "flag", id: "map-route-known", op: "==", value: true },
      { type: "flag", id: "cartographer-reckoned", op: "!=", value: true }
    ],
    choices: [
      {
        id: "give-map",
        label: "Give her the salted map",
        requirements: [{ type: "item", id: "salted-map", op: ">=", value: 1 }],
        success: "She holds it up to a lamp for a long time. Then she pays you more than it is worth and less than it means, and folds it away somewhere near her heart.",
        successEffects: [
          { type: "item", id: "salted-map", amount: -1 },
          { type: "echoes", amount: 10 },
          { type: "flag", id: "cartographer-reckoned", value: true },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      },
      {
        id: "describe-route",
        label: "Describe the route, but keep the map",
        requirements: [],
        challenge: { quality: "poise", difficulty: 5 },
        success: "You tell it well enough that she draws it from your description without a single correction. She nods at you the way one professional nods at another.",
        failure: "Your description wanders. She draws a very beautiful map of somewhere that does not exist and thanks you for it anyway.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "flag", id: "cartographer-reckoned", value: true },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: [
          { type: "flag", id: "cartographer-reckoned", value: true },
          { type: "location", id: "lantern-quay" }
        ]
      }
    ]
  },
  "the-debt-collector": {
    title: "The Debt Collector",
    kicker: "Someone else read the ledgers too",
    text: "A collector in a coat of stitched receipts falls into step beside you. \"You've been in the locked stacks,\" he murmurs. \"Then you know who owes what. Knowledge like that is a debt of its own.\"",
    requirements: [
      { type: "flag", id: "read-the-debt-ledgers", op: "==", value: true },
      { type: "flag", id: "collector-answered", op: "!=", value: true }
    ],
    choices: [
      {
        id: "settle-stranger",
        label: "Quietly settle a stranger's small debt",
        requirements: [{ type: "echoes", op: ">=", value: 5 }],
        success: "You pick a name you will never meet and pay what it owes. The collector crosses it out with visible reluctance and leaves you alone for good.",
        successEffects: [
          { type: "echoes", amount: -5 },
          { type: "quality", id: "poise", amount: 1 },
          { type: "flag", id: "collector-answered", value: true },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      },
      {
        id: "sell-secrets",
        label: "Sell him what you read",
        requirements: [],
        challenge: { quality: "shadow", difficulty: 4 },
        success: "You name three debts he did not know about. He pays you from a pocket full of other people's money and pretends you never met.",
        failure: "He already knew all three, and now he knows you tried to sell them. He smiles, writes something down and moves on.",
        successEffects: [
          { type: "echoes", amount: 16 },
          { type: "quality", id: "shadow", amount: 1 },
          { type: "flag", id: "collector-answered", value: true },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: [
          { type: "flag", id: "collector-answered", value: true },
          { type: "location", id: "velvet-market" }
        ]
      }
    ]
  },
  "an-entry-in-the-index": {
    title: "An Entry in the Index",
    kicker: "You are catalogued now",
    text: "Since your page was bound into the Index of Lost Things, readers have started requesting you. A slip on the librarian's desk bears your name, a shelf mark and a waiting list.",
    requirements: [{ type: "flag", id: "bound-into-the-index", op: "==", value: true }],
    choices: [
      {
        id: "be-borrowed",
        label: "Let a reader borrow you for an afternoon",
        requirements: [],
        success: "An old man asks you what it was like to forget everything. You tell him honestly. He weeps a little, thanks you, and leaves a donation for the archive in your name.",
        successEffects: [
          { type: "echoes", amount: 8 },
          { type: "quality", id: "insight", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: []
      },
      {
        id: "look-yourself-up",
        label: "Look yourself up",
        requirements: [],
        challenge: { quality: "insight", difficulty: 7 },
        success: "Your entry lists a date of arrival, a place of origin that has been carefully rubbed out, and a note in the margin: \"Returned early. Handle kindly.\"",
        failure: "Your entry is currently on loan. The librarian cannot say to whom.",
        successEffects: [
          { type: "flag", id: "read-own-entry", value: true },
          { type: "echoes", amount: 6 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [{ type: "location", id: "hollow-archive" }]
      }
    ]
  },
  "the-gardeners-thanks": {
    title: "The Gardener's Thanks",
    kicker: "A promise kept is remembered",
    text: "The gardener has put the jar of returned darkness on a high shelf, between a jar of rain and a jar of silence. \"People always borrow the light,\" she says. \"Hardly anyone brings back the dark. Ask me for something.\"",
    requirements: [
      { type: "flag", id: "kept-the-sun-promise", op: "==", value: true },
      { type: "flag", id: "gardener-thanked", op: "!=", value: true }
    ],
    choices: [
      {
        id: "ask-purpose",
        label: "Ask what the darkness is for",
        requirements: [],
        success: "\"For sleeping,\" she says. \"Somebody has to. The city lends its dark to whoever needs it most, and forgets to ask for it back.\" You leave understanding the lamps a little better.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 6 },
          { type: "flag", id: "gardener-thanked", value: true },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      },
      {
        id: "ask-work",
        label: "Ask to help tend the gardens",
        requirements: [],
        success: "She hands you a pair of brass shears and shows you which leaves are telling the time wrongly. It is careful, quiet work, and she pays you for it fairly.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "echoes", amount: 10 },
          { type: "flag", id: "gardener-thanked", value: true },
          { type: "location", id: "clockwork-gardens" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-margin-note": {
    title: "The Margin Note",
    kicker: "Returned early. Handle kindly.",
    text: "The note in the margin of your index entry carries a second shelf mark, written very small. It does not belong to any shelf in the archive. The librarian, asked, points silently upward.",
    requirements: [{ type: "flag", id: "read-own-entry", op: "==", value: true }],
    choices: [
      {
        id: "follow-upward",
        label: "Follow the shelf mark up into the High Galleries",
        requirements: [],
        success: "A spiral stair behind the reference desk climbs past the last lamp and keeps going. At the top, under a dome of fogged glass, someone has been expecting you for years and has only just put the kettle on.",
        successEffects: [
          { type: "unlock-location", id: "glass-observatory" },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: []
      },
      {
        id: "copy-note",
        label: "Copy the note into your own hand before you go anywhere",
        requirements: [],
        challenge: { quality: "insight", difficulty: 5 },
        success: "Written out a second time, the shelf mark resolves into a bearing and an elevation. Whoever wrote it was describing a place in the sky, not on a shelf.",
        failure: "Your copy smudges. The original, meanwhile, has become slightly clearer, as though it prefers being read to being reproduced.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "location", id: "hollow-archive" }
        ],
        failureEffects: [{ type: "location", id: "hollow-archive" }]
      }
    ]
  },
  "survey-the-stone-sky": {
    title: "Survey the Stone Sky",
    kicker: "Every crack is catalogued",
    text: "The astronomers here do not look at stars. They look up at the vast stone ceiling over the city and chart its cracks, seepages and slow shifts with the devotion other people save for constellations.",
    requirements: [],
    choices: [
      {
        id: "take-the-lens",
        label: "Take a turn at the great lens",
        requirements: [],
        challenge: { quality: "insight", difficulty: 6 },
        success: "Through the lens the ceiling is enormous and close enough to touch. Near the eastern rim you find a crack no chart has recorded, and a thread of pale light inside it that is not lamplight.",
        failure: "You spend an hour mapping what turns out to be a smear on the lens. The astronomers are very kind about it.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 9 },
          { type: "flag", id: "found-the-far-crack", value: true },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: [{ type: "location", id: "glass-observatory" }]
      },
      {
        id: "carry-plates",
        label: "Carry photographic plates for the astronomers",
        requirements: [],
        success: "The plates are heavy, cold and irreplaceable. You drop none of them. The chief astronomer pays you in echoes and in the rare compliment of being asked back.",
        successEffects: [
          { type: "echoes", amount: 6 },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-lamp-that-fell-upward": {
    title: "The Lamp that Fell Upward",
    kicker: "A small catastrophe in reverse",
    text: "One of the city's street lamps has come loose and fallen the wrong way. It is wedged high in the observatory rafters, still burning, and the astronomers cannot read their charts for the glare.",
    requirements: [],
    choices: [
      {
        id: "climb-for-it",
        label: "Climb the rafters and set it loose",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 7 },
        success: "You work it free with your coat wrapped round your hands. Released, it drifts gently back down through the dome and toward the street it came from, as if nothing had happened.",
        failure: "The rafters are further apart than they looked from the floor. You come down the slow way, without the lamp and with a new respect for gravity.",
        successEffects: [
          { type: "quality", id: "nerve", amount: 1 },
          { type: "echoes", amount: 12 },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: [{ type: "location", id: "glass-observatory" }]
      },
      {
        id: "leave-lamp",
        label: "Suggest they leave it; it seems happy up there",
        requirements: [],
        success: "The astronomers confer and decide that a lamp which wants to be a star should be allowed to try. They mark it on the chart with a very small, very formal asterisk.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-far-crack": {
    title: "The Far Crack",
    kicker: "Light that is not lamplight",
    text: "You return to the uncharted crack at the eastern rim. The thread of pale light is still there, thin as a hair and utterly steady. The chief astronomer stands beside you and, for once, says nothing.",
    requirements: [
      { type: "flag", id: "found-the-far-crack", op: "==", value: true },
      { type: "flag", id: "far-crack-answered", op: "!=", value: true }
    ],
    choices: [
      {
        id: "signal",
        label: "Hold your small sun up to the crack",
        requirements: [{ type: "item", id: "small-sun", op: ">=", value: 1 }],
        success: "For a moment the small sun and the thin light are the same colour. Then the thread of light flickers: once, twice, three times. Someone, very far above, has seen you. The small sun goes out in your hands, entirely spent.",
        successEffects: [
          { type: "item", id: "small-sun", amount: -1 },
          { type: "echoes", amount: 20 },
          { type: "flag", id: "signalled-the-surface", value: true },
          { type: "flag", id: "far-crack-answered", value: true },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: []
      },
      {
        id: "chart-it",
        label: "Help the astronomers chart it properly",
        requirements: [],
        success: "It takes all night. When the chart is finished the crack has a name, a number, and a column of careful measurements. Your name is in the margin as its discoverer.",
        successEffects: [
          { type: "quality", id: "insight", amount: 1 },
          { type: "echoes", amount: 8 },
          { type: "flag", id: "far-crack-answered", value: true },
          { type: "location", id: "glass-observatory" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-submerged-door": {
    once: true,
    title: "The Submerged Door",
    kicker: "The key remembers the lock",
    text: "Since you went down the drowned stair, the brass key you woke holding has grown heavy whenever you pass the water. It knows the door below better than you do.",
    requirements: [
      { type: "item", id: "brass-key", op: ">=", value: 1 },
      { type: "flag", id: "bell-under-water:descend", op: "==", value: true }
    ],
    choices: [
      {
        id: "leave-key",
        label: "Go back down and leave the key in its lock",
        requirements: [],
        challenge: { quality: "nerve", difficulty: 6 },
        success: "The door accepts the key with a sigh of old water. Behind it, a narrow hall is lined with keys exactly like yours, each labelled with a name. There is an empty hook with your name on it. You leave the key where it belongs, and feel lighter than you have since waking.",
        failure: "The cold turns you back before the last step. The key stays in your pocket, patient as ever.",
        successEffects: [
          { type: "item", id: "brass-key", amount: -1 },
          { type: "quality", id: "nerve", amount: 1 },
          { type: "echoes", amount: 10 },
          { type: "flag", id: "returned-the-brass-key", value: true },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: [{ type: "location", id: "lantern-quay" }]
      },
      {
        id: "keep-key",
        label: "Keep it. You are not ready to be hung on a hook.",
        requirements: [],
        success: "You close your hand around the key until it cools. Whatever waits below can go on waiting.",
        successEffects: [
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "lantern-quay" }
        ],
        failureEffects: []
      }
    ]
  },
  "the-loose-end": {
    title: "The Loose End",
    kicker: "Something still tied to you",
    text: "You kept the cut end of the red thread. It will not lie flat in your pocket; it keeps curling toward the market's inner curtains, as if the knot it lost is still somewhere nearby.",
    requirements: [{ type: "item", id: "red-thread-end", op: ">=", value: 1 }],
    choices: [
      {
        id: "follow-end",
        label: "Let the loose end lead you",
        requirements: [],
        challenge: { quality: "insight", difficulty: 5 },
        success: "It leads you behind a curtain to a stall selling mended things. The stallholder ties your thread back into a larger red weave, thanks you for returning a missing stitch, and pays you for your trouble.",
        failure: "It leads you in a slow circle back to where you started. The thread seems pleased with itself.",
        successEffects: [
          { type: "item", id: "red-thread-end", amount: -1 },
          { type: "echoes", amount: 9 },
          { type: "quality", id: "insight", amount: 1 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: [{ type: "location", id: "velvet-market" }]
      },
      {
        id: "tie-finger",
        label: "Tie it round your finger, so you do not forget",
        requirements: [],
        success: "It knots itself neatly. For the rest of the day you remember every name you hear, and forget none of them afterwards.",
        successEffects: [
          { type: "item", id: "red-thread-end", amount: -1 },
          { type: "quality", id: "poise", amount: 1 },
          { type: "location", id: "velvet-market" }
        ],
        failureEffects: []
      }
    ]
  }
};
