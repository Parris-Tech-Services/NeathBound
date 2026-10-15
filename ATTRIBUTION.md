# Artwork provenance and historical attribution

## Active production artwork

NeathBound's shipped scenery and story art uses **original locally hosted AI-generated WebP files** in `assets/art/`: `neath-hero.webp`, `chamber.webp`, `archive.webp`, `waterway.webp`, `market.webp`, `garden.webp`, and `foundry.webp`. See [assets/art/README.md](assets/art/README.md) for the original art production notes.

The site's stylesheet `src/styles.css` now references local assets, not third-party Wikimedia URLs. The page's CSS version was bumped to invalidate caches; `src/ui/render.js` already selects local illustration files. The public game does not need Wikimedia to display these visuals.

## Historical open-asset experiment (retired)

The former CSS artwork layer referenced freely licensed Wikimedia images but relied on network hotlinks. Those remote URLs sometimes failed with Chromium `ERR_BLOCKED_BY_ORB`; they were replaced in the runtime with the original generated local art on 15 October 2026. Source metadata is retained in [assets/open-assets.json](assets/open-assets.json) as **historical provenance**, not a record of active media requests.

The prior asset set included: AsPJT's Ishigaki Stalactite Cave (CC0), Iroi su's paper texture (CC0), Endofskull's magnifying glass (public domain), a historical 1807 map (public domain), a Rijksmuseum teacup derivative (CC0), InfoSources' library books (public domain), diego_torres' Cromer pier (CC0), Pearson Scott Foresman's Diving Bell (public domain), and Battista Beccario's portolan map (public domain). Original source URLs and item-level attribution are retained in `assets/open-assets.json`.

This historic list does not grant permission to copy proprietary artwork from other browser games. Original story writing and game systems are separate from these decorative visuals.
