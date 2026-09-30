export const itemDefinitions = {
  "salted-map": {
    name: "Salted Map",
    description: "A self-redrawing map stiff with old sea-salt. Useful when a route refuses to stay put.",
    category: "Curiosity",
    equipSlot: "tool",
    modifiers: { insight: 1 },
    sellValue: 4
  },
  "brass-key": {
    name: "Brass Key",
    description: "The key you woke holding. It is warm near doors that have opinions.",
    category: "Key",
    sellValue: 0
  },
  "black-sand": {
    name: "Black Sand",
    description: "Sand from beneath the bell. It settles into shapes when nobody watches.",
    category: "Curiosity",
    sellValue: 3
  },
  "silver-thimble": {
    name: "Silver Thimble",
    description: "A tailor's thimble that steadies the hand and improves difficult appearances.",
    category: "Charm",
    equipSlot: "charm",
    modifiers: { poise: 1 },
    sellValue: 5
  },
  "archive-key": {
    name: "Archive Key",
    description: "An iron key shaped for a question-mark lock.",
    category: "Key",
    sellValue: 2
  },
  "bright-memory": {
    name: "Bright Memory",
    description: "A memory sharpened into something almost tangible.",
    category: "Charm",
    equipSlot: "charm",
    modifiers: { insight: 1 },
    sellValue: 6
  },
  "unfinished-page": {
    name: "Unfinished Page",
    description: "Your handwriting, ending halfway through a warning.",
    category: "Document",
    sellValue: 4
  },
  "tide-cup": {
    name: "Tide Cup",
    description: "A porcelain cup the sea once filled for you.",
    category: "Curiosity",
    sellValue: 5
  },
  "ink-of-absence": {
    name: "Ink of Absence",
    description: "Ink that makes whatever it touches harder to remember.",
    category: "Material",
    sellValue: 7
  },
  "sun-seed": {
    name: "Sun Seed",
    description: "A warm seed that remembers a sky the city cannot see.",
    category: "Seed",
    sellValue: 7
  },
  "small-sun": {
    name: "Small Sun",
    description: "A thumb-sized borrowed sun. It improves courage and makes darkness notice you.",
    category: "Charm",
    equipSlot: "charm",
    modifiers: { nerve: 1 },
    sellValue: 8
  },
  "red-thread-end": {
    name: "Loose Red Thread",
    description: "The cut end of a thread that once promised to find what was lost.",
    category: "Curiosity",
    sellValue: 2
  },
  "dock-coat": {
    name: "Dockworker's Coat",
    description: "Heavy, weatherproof and reassuringly difficult to stab through.",
    category: "Clothing",
    equipSlot: "coat",
    modifiers: { nerve: 1 },
    price: 20,
    sellValue: 10
  },
  "archive-lenses": {
    name: "Archive Lenses",
    description: "Smoked lenses etched with tiny index marks. They reveal annotations in the dark.",
    category: "Tool",
    equipSlot: "tool",
    modifiers: { insight: 2 },
    price: 25,
    sellValue: 12
  },
  "velvet-gloves": {
    name: "Velvet Gloves",
    description: "Elegant gloves with pockets in places nobody expects.",
    category: "Clothing",
    equipSlot: "charm",
    modifiers: { poise: 1, shadow: 1 },
    price: 18,
    sellValue: 9
  }
};

export const bazaarStock = ["dock-coat", "archive-lenses", "velvet-gloves"];

export function itemDefinition(id) {
  return itemDefinitions[id] ?? {
    name: title(id),
    description: "The city has not yet supplied a proper catalogue entry for this possession.",
    category: "Possession",
    sellValue: 0
  };
}

export function equipmentBonuses(state) {
  const totals = {};
  for (const itemId of Object.values(state.equipment ?? {})) {
    if (!itemId) continue;
    for (const [quality, amount] of Object.entries(itemDefinition(itemId).modifiers ?? {})) {
      totals[quality] = (totals[quality] ?? 0) + Number(amount);
    }
  }
  return totals;
}

function title(value) {
  return String(value ?? "").split("-").map((part) => part ? part[0].toUpperCase() + part.slice(1) : "").join(" ");
}
