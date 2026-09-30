export const OPPORTUNITY_DECK = {
  id: "neathbound-opportunities",
  name: "Opportunities",
  cardIds: [
    "knock-beneath-the-floor",
    "note-in-green-ink",
    "silk-masked-stranger",
    "city-breathes-in",
    "debt-comes-due"
  ]
};

export const OPPORTUNITY_CARDS = {
  "knock-beneath-the-floor": {
    title: "A Knock Beneath the Floor",
    text: "Three polite knocks sound from beneath the stones. There is no room below this room.",
    weight: 3,
    requirements: [],
    choices: [
      {
        id: "answer",
        label: "Knock back",
        challenge: { quality: "nerve", difficulty: 5 },
        success: "Something below approves of your rhythm and leaves a coin where no crack existed.",
        failure: "The reply comes from directly beneath your chair.",
        successEffects: [{ type: "echoes", amount: 4 }, { type: "momentum", amount: 1 }],
        failureEffects: [{ type: "menace", id: "dread", amount: 1 }]
      }
    ]
  },
  "note-in-green-ink": {
    title: "A Note in Green Ink",
    text: "A note arrives addressed to the version of you who made a different decision yesterday.",
    weight: 2,
    requirements: [],
    choices: [
      {
        id: "read",
        label: "Read what might have been",
        challenge: { quality: "insight", difficulty: 5 },
        success: "For one bright moment, both versions of you understand each other.",
        failure: "The handwriting becomes less familiar with every line.",
        successEffects: [{ type: "quality", id: "insight", amount: 1 }],
        failureEffects: [{ type: "menace", id: "dread", amount: 1 }]
      }
    ]
  },
  "silk-masked-stranger": {
    title: "The Silk-Masked Stranger",
    text: "A stranger asks whether you are available to be mistaken for somebody important.",
    weight: 2,
    requirements: [],
    choices: [
      {
        id: "agree",
        label: "Be convincingly somebody else",
        challenge: { quality: "poise", difficulty: 5 },
        success: "Nobody notices the substitution until after you have been paid.",
        failure: "Everyone notices. Fortunately, they disagree about who you actually are.",
        successEffects: [{ type: "echoes", amount: 6 }],
        failureEffects: [{ type: "menace", id: "suspicion", amount: 1 }]
      }
    ]
  },
  "city-breathes-in": {
    title: "The City Breathes In",
    text: "Every lamp guttering at once is probably coincidence. Probably.",
    weight: 3,
    requirements: [],
    choices: [
      {
        id: "listen",
        label: "Stand still and listen",
        challenge: false,
        success: "You catch the rhythm under the streets. It will help when certainty runs thin.",
        successEffects: [{ type: "momentum", amount: 1 }],
        failureEffects: []
      }
    ]
  },
  "debt-comes-due": {
    title: "A Debt Comes Due",
    text: "A small envelope contains a bill for a favour you do not remember receiving.",
    weight: 1,
    requirements: [{ type: "echoes", op: ">=", value: 3 }],
    choices: [
      {
        id: "pay",
        label: "Pay without asking",
        challenge: false,
        success: "The receipt is stamped PAID BEFORE INCURRENCE.",
        successEffects: [{ type: "echoes", amount: -3 }, { type: "menace", id: "suspicion", amount: -1 }],
        failureEffects: []
      },
      {
        id: "investigate",
        label: "Investigate the creditor",
        challenge: { quality: "shadow", difficulty: 5 },
        success: "There is no creditor. There is, however, a useful empty office.",
        failure: "The office is occupied after all, by someone taking notes.",
        successEffects: [{ type: "echoes", amount: 5 }],
        failureEffects: [{ type: "menace", id: "suspicion", amount: 1 }]
      }
    ]
  }
};
