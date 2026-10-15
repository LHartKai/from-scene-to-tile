# From Scene to Tile

A Foundry Virtual Tabletop module for capturing a free-form polygon from a scene's background image and creating a transparent Tile from the selected region.

## Goals

- Support Foundry VTT v13 and v14.
- Select a polygon by placing free-form vertices on the canvas.
- Preview the polygon and edit the selection before committing.
- Export the background image inside the polygon as a transparent PNG.
- Upload the image using Foundry's FilePicker API and create a Tile aligned to the selection.
- Provide graceful cancellation, validation, errors, and localization.
- Avoid capturing tokens, lighting, walls, or other rendered canvas objects; the source is the scene background image only.

## Status

Initial project scaffold. Compatibility and coordinate transforms still need validation against real v13/v14 scenes, including scaled backgrounds.

## Installation

Once a release is published, use the module manifest URL from the GitHub Releases page or install from the Foundry package browser when listed.

## Development

The module is being developed for Foundry VTT v13 and v14. Both core versions must be tested before a stable release is declared.

## License

MIT. See [LICENSE](LICENSE).
