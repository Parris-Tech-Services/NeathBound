export const ITEM_CATALOG = {
  "salted-map": {
    name: "Salted Map",
    description: "A map stiff with old brine. Its coastlines move when it is damp.",
    category: "story",
    sellable: false
  },
  "brass-key": {
    name: "Brass Key",
    description: "Warm even in cold rooms. It remembers a submerged lock.",
    category: "story",
    sellable: false
  },
  "archive-key": {
    name: "Archive Key",
    description: "A narrow iron key stamped with a catalogue number that does not exist.",
    category: "story",
    sellable: false
  },
  "black-sand": {
    name: "Black Sand",
    description: "Fine grains from somewhere the tide should not reach.",
    category: "curiosity",
    sellable: true,
    sellValue: 2,
    useEffects: [{ type: "item", id: "black-sand", amount: -1 }, { type: "quality", id: "shadow", amount: 1 }],
    useText: "You let the sand run through your fingers. Its shadows cling to you."
  },
  "bright-memory": {
    name: "Bright Memory",
    description: "A recollection polished until it can cut through hesitation.",
    category: "curiosity",
    sellable: false,
    useEffects: [{ type: "item", id: "bright-memory", amount: -1 }, { type: "momentum", amount: 2 }],
    useText: "You remember with painful clarity. For a while, certainty follows you."
  },
  "ink-of-absence": {
    name: "Ink of Absence",
    description: "Ink that records what was deliberately omitted.",
    category: "curiosity",
    sellable: true,
    sellValue: 5,
    useEffects: [{ type: "item", id: "ink-of-absence", amount: -1 }, { type: "quality", id: "insight", amount: 1 }],
    useText: "You write one sentence and erase another. The omission teaches you more."
  },
  "red-thread-end": {
    name: "Loose End of Red Thread",
    description: "A severed thread that still tugs toward unfinished business.",
    category: "story",
    sellable: false
  },
  "silver-thimble": {
    name: "Silver Thimble",
    description: "A tailor's tool, cold as moonlight and useful for impossible stitching.",
    category: "story",
    sellable: false
  },
  "small-sun": {
    name: "Small Sun",
    description: "A captive dawn in miniature. It warms whatever promise carries it.",
    category: "story",
    sellable: false
  },
  "sun-seed": {
    name: "Sun Seed",
    description: "A brass seed with a tiny daybreak folded inside.",
    category: "story",
    sellable: false
  },
  "tide-cup": {
    name: "Tide Cup",
    description: "A cup that tastes faintly of a shore that never existed.",
    category: "story",
    sellable: false
  },
  "unfinished-page": {
    name: "Unfinished Page",
    description: "Your handwriting is on it. You do not remember writing it.",
    category: "story",
    sellable: false
  },

  "dock-coat": {
    name: "Dockworker's Coat",
    description: "Heavy, tar-dark and reassuringly difficult to tear.",
    category: "equipment",
    slot: "attire",
    price: 18,
    sellValue: 9,
    modifiers: { nerve: 1 }
  },
  "archive-linen": {
    name: "Archive Linen",
    description: "Pale sleeves lined with tiny index marks. Thoughts sit straighter in it.",
    category: "equipment",
    slot: "attire",
    price: 20,
    sellValue: 10,
    modifiers: { insight: 1 }
  },
  "velvet-gloves": {
    name: "Velvet Gloves",
    description: "Soft enough for diplomacy, dark enough for theft.",
    category: "equipment",
    slot: "accessory",
    price: 16,
    sellValue: 8,
    modifiers: { poise: 1 }
  },
  "smoked-lenses": {
    name: "Smoked Lenses",
    description: "They hide your eyes and reveal reflections that should not be there.",
    category: "equipment",
    slot: "tool",
    price: 22,
    sellValue: 11,
    modifiers: { shadow: 1, insight: 1 }
  },

  "bottled-calm": {
    name: "Bottled Calm",
    description: "One measured breath, stoppered in blue glass.",
    category: "consumable",
    price: 6,
    sellValue: 2,
    useEffects: [{ type: "item", id: "bottled-calm", amount: -1 }, { type: "menace", id: "dread", amount: -2 }],
    useText: "You uncork a quieter moment. The city recedes by half a step."
  },
  "bandage-roll": {
    name: "Bandage Roll",
    description: "Clean cloth, which is rarer below than anyone admits.",
    category: "consumable",
    price: 5,
    sellValue: 2,
    useEffects: [{ type: "item", id: "bandage-roll", amount: -1 }, { type: "menace", id: "wounds", amount: -2 }],
    useText: "You bind what hurts and continue."
  },
  "sealed-apology": {
    name: "Sealed Apology",
    description: "A beautifully worded regret with the recipient left blank.",
    category: "consumable",
    price: 7,
    sellValue: 3,
    useEffects: [{ type: "item", id: "sealed-apology", amount: -1 }, { type: "menace", id: "scandal", amount: -2 }],
    useText: "The apology reaches exactly the ears it needed to."
  },
  "false-name": {
    name: "False Name",
    description: "Printed on excellent card stock. Convincing until examined twice.",
    category: "consumable",
    price: 7,
    sellValue: 3,
    useEffects: [{ type: "item", id: "false-name", amount: -1 }, { type: "menace", id: "suspicion", amount: -2 }],
    useText: "For a while, the questions are about someone else."
  }
};

export const SHOP_CATALOG = [
  "dock-coat",
  "archive-linen",
  "velvet-gloves",
  "smoked-lenses",
  "bottled-calm",
  "bandage-roll",
  "sealed-apology",
  "false-name"
];

export const EQUIPMENT_SLOTS = ["attire", "accessory", "tool"];

export function itemInfo(id) {
  return ITEM_CATALOG[id] ?? {
    name: title(id),
    description: "A possession whose significance is not yet fully understood.",
    category: "curiosity",
    sellable: false
  };
}

export function qualityModifier(state, qualityId) {
  let total = 0;
  for (const itemId of Object.values(state.equipped ?? {})) {
    if (!itemId) continue;
    total += Number(itemInfo(itemId).modifiers?.[qualityId] ?? 0);
  }
  return total;
}

export function effectiveQualityValue(state, qualityId) {
  return Number(state.qualities?.[qualityId] ?? 0) + qualityModifier(state, qualityId);
}

export function mutateSystemAction(state, action, payload = {}) {
  switch (action) {
    case "buy": return buy(state, payload.itemId);
    case "sell": return sell(state, payload.itemId);
    case "equip": return equip(state, payload.itemId);
    case "unequip": return unequip(state, payload.slot);
    case "use": return use(state, payload.itemId);
    case "recover": return recover(state, payload.menaceId);
    case "save-outfit": return saveOutfit(state, payload.outfitId);
    case "apply-outfit": return applyOutfit(state, payload.outfitId);
    default: return { error: "Unknown action." };
  }
}

function buy(state, itemId) {
  const item = itemInfo(itemId);
  if (!SHOP_CATALOG.includes(itemId) || !Number.isFinite(item.price)) return { error: "That item is not for sale." };
  if ((state.echoes ?? 0) < item.price) return { error: `You need ${item.price} Echoes for that.` };
  state.echoes -= item.price;
  state.items[itemId] = (state.items[itemId] ?? 0) + 1;
  return { title: "The Bazaar", text: `You purchase ${item.name} for ${item.price} Echoes.` };
}

function sell(state, itemId) {
  const item = itemInfo(itemId);
  if ((state.items?.[itemId] ?? 0) < 1) return { error: "You do not possess that." };
  if (!item.sellable && item.category !== "equipment" && item.category !== "consumable") return { error: "That possession is too important to sell." };
  const value = Number(item.sellValue ?? 0);
  if (value <= 0) return { error: "No respectable buyer will take it." };
  if (Object.values(state.equipped ?? {}).includes(itemId)) return { error: "Unequip that item before selling it." };
  state.items[itemId] -= 1;
  if (state.items[itemId] <= 0) delete state.items[itemId];
  state.echoes += value;
  return { title: "The Bazaar", text: `You sell ${item.name} for ${value} Echoes.` };
}

function equip(state, itemId) {
  const item = itemInfo(itemId);
  if ((state.items?.[itemId] ?? 0) < 1) return { error: "You do not possess that." };
  if (!item.slot) return { error: "That possession cannot be equipped." };
  state.equipped ??= {};
  state.equipped[item.slot] = itemId;
  return { title: "Outfit", text: `You equip ${item.name}.` };
}

function unequip(state, slot) {
  if (!EQUIPMENT_SLOTS.includes(slot)) return { error: "Unknown equipment slot." };
  state.equipped ??= {};
  const itemId = state.equipped[slot];
  if (!itemId) return { error: "That slot is already empty." };
  delete state.equipped[slot];
  return { title: "Outfit", text: `You put away ${itemInfo(itemId).name}.` };
}

function use(state, itemId) {
  const item = itemInfo(itemId);
  if ((state.items?.[itemId] ?? 0) < 1) return { error: "You do not possess that." };
  if (!item.useEffects?.length) return { error: "That possession has no direct use here." };
  return { title: item.name, text: item.useText ?? `You use ${item.name}.`, effects: item.useEffects };
}

function recover(state, menaceId) {
  const current = Number(state.menaces?.[menaceId] ?? 0);
  if (current <= 0) return { error: "That menace is already at zero." };
  const cost = Math.max(2, Math.min(8, current + 1));
  if ((state.echoes ?? 0) < cost) return { error: `Recovery costs ${cost} Echoes.` };
  state.echoes -= cost;
  state.menaces[menaceId] = Math.max(0, current - 1);
  return { title: "A quieter hour", text: `You spend ${cost} Echoes arranging a little safety. ${title(menaceId)} falls by 1.` };
}

function title(value) {
  return String(value ?? "").split("-").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}


function saveOutfit(state, outfitId) {
  if (!["morning-outfit", "working-outfit", "dangerous-outfit"].includes(outfitId)) {
    return { error: "Unknown outfit." };
  }
  state.savedOutfits ??= {};
  state.savedOutfits[outfitId] = { ...(state.equipped ?? {}) };
  state.activeOutfit = outfitId;
  return { title: "Outfit", text: `You save your current equipment as ${title(outfitId)}.` };
}

function applyOutfit(state, outfitId) {
  const outfit = state.savedOutfits?.[outfitId];
  if (!outfit || typeof outfit !== "object") return { error: "That outfit has not been saved yet." };
  for (const itemId of Object.values(outfit)) {
    if (itemId && (state.items?.[itemId] ?? 0) < 1) {
      return { error: `You no longer possess ${itemInfo(itemId).name}.` };
    }
  }
  state.equipped = { ...outfit };
  state.activeOutfit = outfitId;
  return { title: "Outfit", text: `You change into ${title(outfitId)}.` };
}
