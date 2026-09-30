const fs = require("fs");
let content = fs.readFileSync("src/ui/render.js", "utf8");
content = content.replace("const storiesHtml = stories.map((story) => {", 
`const renderStory = (story, isCard = false) => {
    const available = new Set(availableChoices(state, story.id).map((choice) => choice.id));
    const choicesHtml = story.choices.map((choice) => {
      const resolvedChallenge = effectiveChallenge(story, choice);
      const challengeQuality = resolvedChallenge?.quality ?? resolvedChallenge?.stat;
      const challenge = resolvedChallenge
        ? [
            '<div class="challenge-line">',
            '<span class="challenge-icon">', icon[challengeQuality] ?? "•", '</span>',
            '<span><strong>', formatName(challengeQuality), ' challenge</strong>',
            '<small>', escapeHtml(challengeSummary(state, resolvedChallenge)), '</small></span></div>'
          ].join("")
        : '<div class="challenge-line simple"><span class="challenge-icon">◆</span><span><strong>A straightforward choice</strong><small>No challenge roll</small></span></div>';

      return [
        '<div class="choice-row">',
        '<div class="choice-copy"><strong>', escapeHtml(choice.label), '</strong>', challenge, '</div>',
        '<button class="go-button" data-story="', story.id, '" data-choice="', choice.id, '" ',
        available.has(choice.id) ? "" : "disabled",
        '>GO</button></div>'
      ].join("");
    }).join("");

    return [
      '<article class="storylet', isCard ? ' opportunity-card' : '', '">',
      isCard ? ['<div class="card-discard-header"><button class="discard-button" data-action="discard" data-card="', story.id, '" aria-label="Discard">✗</button></div>'].join("") : '',
      '<div class="story-art story-art-', escapeClass(story.id), '" aria-hidden="true">', storyArtSvg(story.id, state.locationId), '</div>',
      '<div class="story-body">',
      '<button class="bookmark', preferences.bookmarks.includes(story.id) ? ' is-bookmarked' : '', '" type="button" data-action="bookmark" data-story="', story.id, '" aria-label="', preferences.bookmarks.includes(story.id) ? 'Remove bookmark' : 'Bookmark story', '" aria-pressed="', preferences.bookmarks.includes(story.id), '">◆</button>',
      '<h3>', escapeHtml(story.title), '</h3>',
      '<p>', escapeHtml(story.text), '</p>',
      '<div class="story-choices">', choicesHtml, '</div>',
      '</div></article>'
    ].join("");
  };

  const storiesHtml = stories.map(s => renderStory(s, false)).join("");
  
  let deckHtml = "";
  if (state.flags["tutorial.cards"]) {
    const hand = state.hand || [];
    const MAX_HAND = 3;
    const drawButton = hand.length < MAX_HAND
      ? \`<button class="draw-card-button" data-action="draw-card" data-deck="whispers">Draw a Card (\${hand.length}/\${MAX_HAND})</button>\`
      : \`<button class="draw-card-button disabled" disabled>Hand Full (\${MAX_HAND}/\${MAX_HAND})</button>\`;
      
    const handHtml = hand.map(id => cards[id] ? renderStory({ id, ...cards[id] }, true) : "").join("");
    deckHtml = \`<section class="whispers-deck">
      <div class="deck-controls">\${drawButton}</div>
      <div class="deck-hand">\${handHtml}</div>
    </section>\`;
  }
`);

// Delete old choices mapping logic:
content = content.replace(/const available = new Set\(availableChoices\(state, story\.id\).*?\}\)\.join\(""\);\n\n/s, "");

content = content.replace("'<section class=\"story-stack\">', storiesHtml, '</section>',", "deckHtml, '<section class=\"story-stack\">', storiesHtml, '</section>',");

fs.writeFileSync("src/ui/render.js", content);
