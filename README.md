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

Early development scaffold, not yet a stable release. The code has not yet been integration-tested in Foundry v13 or v14. Do not treat the compatibility range in the manifest as proof of testing.

Current limitations:
- Captures the source background image only; tokens, walls, lights, weather, and other rendered layers are excluded.
- Background rotation/skew are explicitly unsupported.
- Coordinate mapping must be verified with both v13 and v14, including resized backgrounds and different canvas zoom levels.
- Upload permissions and destination paths depend on the active Foundry hosting setup.
- Selection currently supports polygon vertices, Enter/right-click to finish, Backspace to undo a vertex, and Escape to cancel.

## Installation

Not yet released. For development, place this repository directory in the Foundry `Data/modules/from-scene-to-tile` folder and enable it in Manage Modules. Back up your world and test on a disposable scene first.

## Development

The module is being developed for Foundry VTT v13 and v14. Both core versions must be tested before a stable release is declared.

## License

MIT. See [LICENSE](LICENSE).
