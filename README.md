# ⚠️ AI WAS USED FOR CODING ⚠️
---

# From Scene to Tile

Simple module that let you create Tiles direct from a selected area in your viewed scene. For now, it only captures things present on the background image; tokens, walls, lights, weather, and other rendered layers are excluded.

---

## How to Use

- Go to the scene you want to make a tile based on.
- CTRL + SHIFT + T to start selection. You still can move around the scene with Right Mouse during the selection.
- Click Left Mouse to add points. You need atleast 3 points to create a tile.
- Double Click Left Mouse or Enter finish and create your tile.
- Middle Mouse Click remove last created point. Removing all points don't finish your selection.
- Backspace cancel the selection without creating a tile.

---

## Game Settings

### Tiles Directory
Path for where the images created by this module will go. Default is inside your current world folder.

### Format Selection
Choose in wich format the module will save images: PNG or Webp. Changing this setting won't change the format from already existing images.

---

## Controls Configuration
Keybord hotkeys are configurable. Defaults are:
- Start Selection: CTRL + SHIFT + T
- Confirm Selection: Enter
- Cancel Selection: Backspace
- Add Point on Cursor Position: V
- Remove Last Point: CTRL + Z
