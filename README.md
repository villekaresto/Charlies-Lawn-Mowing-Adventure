# Charlie's Lawn Mowing Adventure

A tiny browser game where you mow lawns, dodge obstacles and collect power‑ups.

## Contributing Art

Game art lives under `assets/obstacles/` and `assets/powerups/`.

- **Format**: SVG files.
- **Size**: roughly 32×32 px. Keep artwork square and centred.
- **Preprocessing**: run `npx svgo your-file.svg` to strip metadata and keep the file lean.
- **Preload**: the game preloads all SVGs at startup so new files must be added to the loader list in `index.html`.
- **Registering**:
  - Obstacles are listed in the `kinds` array in `index.html`. Add an entry with an id, the emoji or image reference, and the width/height.
  - Power‑ups are pushed to the `powerUps` array inside `setup()`. Duplicate an existing block to add new ones and provide your image reference.

This keeps gameplay smooth and ensures every asset is ready before a level begins.
