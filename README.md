# From Scene to Tile

A simple module that let you create Tiles direct from a selected area in your viewed scene.

## How to Use

- Go to the scene you want to make a tile based on.
- CTRL + SHIFT + T to start selection. You still can move around the scene with Right Mouse during the selection.
- Click Left Mouse to add points.
- Double Click Left Mouse or Enter finish and create your tile.
- Middle Mouse Click remove a point.
- Backspace cancel the selection without creating a tile.

## Game Settings

### Tiles Directory
Path for where the images created by this module will go.

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
