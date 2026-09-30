export const locations = {
  "lantern-quay": {
    name: "Lantern Quay",
    region: "The Lower City",
    subtitle: "Where the tide carries messages in sealed bottles.",
    atmosphere: "Wet brass, coal smoke, and a bell that rings beneath the water.",
    stories: ["bell-under-water", "cartographer-at-dusk", "tea-for-the-tide", "salt-on-the-map", "return-the-darkness"]
  },
  "velvet-market": {
    name: "The Velvet Market",
    region: "The Lower City",
    subtitle: "A bazaar for memories, rumours, and perfectly ordinary knives.",
    atmosphere: "Every stall has a curtain. Every curtain has a shadow behind it.",
    stories: ["borrowed-face", "red-thread", "market-gossip", "the-sand-reader", "unwritten-ink"]
  },
  "hollow-archive": {
    name: "The Hollow Archive",
    region: "The Lower City",
    subtitle: "A library where the books remember who borrowed them.",
    atmosphere: "Dust hangs in the air like a second, slower snowfall.",
    stories: ["index-of-lost-things", "the-quiet-librarian", "catalogue-the-dark", "the-locked-stacks", "finish-the-page"]
  },
  "clockwork-gardens": {
    name: "The Clockwork Gardens",
    region: "The High Galleries",
    subtitle: "A greenhouse where the flowers keep appointments.",
    atmosphere: "Brass leaves click together in the warm, artificial wind.",
    stories: ["garden-appointment", "borrowed-sunlight", "plant-the-sun-seed", "the-seedling-dawn", "the-memory-graft"]
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
  },
  "tea-for-the-tide": {
    title: "Tea for the Tide",
    kicker: "A courtesy to the current",
    text: "The tide has come in carrying a porcelain cup. A dockworker asks whether you will pour it back into the sea, or drink what the sea has prepared.",
    tags: ["opportunity"],
    choices: [
      { id: "pour", label: "Pour the tea into the tide", requirements: [], success: "The water settles. The dockworker gives you a name to use at the market.", successEffects: [{ type: "flag", id: "acquaintance-dockworker", value: true }, { type: "quality", id: "poise", amount: 1 }, { type: "location", id: "lantern-quay" }], failureEffects: [] },
      { id: "drink", label: "Drink the impossible tea", requirements: [], success: "You remember a shore that has never existed.", failure: "The cup tastes of every promise you have broken.", challenge: { quality: "nerve", difficulty: 5 }, successEffects: [{ type: "item", id: "tide-cup", amount: 1 }, { type: "quality", id: "dread", amount: 1 }, { type: "location", id: "hollow-archive" }], failureEffects: [{ type: "quality", id: "dread", amount: 1 }, { type: "location", id: "hollow-archive" }] }
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
    challenge: { quality: "insight", difficulty: 7 },
    choices: [
      { id: "catalogue", label: "Give the darkness its titles", success: "The shelf becomes legible. The archive records your name with a respectful error.", failure: "The darkness gives you a title instead.", reward: { echoes: 15, item: "ink-of-absence" }, target: "hollow-archive" },
      { id: "close-shelf", label: "Close the shelf", success: "Some knowledge is safer when it remains unindexed.", reward: { menace: ["suspicion", -1] }, target: "lantern-quay" }
    ]
  },
  "garden-appointment": {
    title: "The Garden Appointment",
    kicker: "A flower expects you",
    text: "A clockwork flower has scheduled a meeting for you at the far end of the glasshouse. It has sent three reminders and one threat.",
    requirements: [{ type: "item", id: "tide-cup", op: ">=", value: 1 }],
    challenge: { quality: "poise", difficulty: 6 },
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
    requirements: [
      { type: "item", id: "sun-seed", op: ">=", value: 1 },
      { type: "flag", id: "plant-the-sun-seed:plant", op: "!=", value: true }
    ],
    choices: [
      {
        id: "plant",
        label: "Plant it in the brass bed",
        requirements: [],
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
  }
};
