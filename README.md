# ⚠️ AI DISCLAIMER ⚠️

Generative AI was used only for codding and some minor grammal corrections, 97% of the texts present in this module were all writted by me. Testing and bug hunt are also all made by me.

I have some programming knowledge that i acquired over the years by rummaging around some mod files i downloaded for games in addition of some actual programming classes/courses and self-teaching i did, so i know how to indentify, manually change and correct some thing by my own. Still, i don't consider myself a competent programmer with the capabilities needed to create a whole module alone.

All that said, i want to keep this module as much up-to-date i can and not let it just be a AI-Slop Vibe Coded module that will be left to rotten. 

---

# From Scene to Tile

Simple module that let you create Tiles direct from a selected area in your viewed scene. For now, it only captures things present on the background image; tokens, walls, lights, weather, and other rendered layers are excluded. I made this cus i love to crop pieces of the map and create overhead parts but i was having a lot of headache to perfectly match the size in the actual map inside Foundry...maybe a skill issue on my part but..well, hopes it help somebody else ¯\_(ツ)_/¯.

---

## How to Use

First of all, go to the scene you want to crop a piece of, then follow the control chart as you need.

| Action | Default Keyboard Input | Default Mouse Input | Dev Note |
| :---: | :---: | :---: | :---: |
| **Start Selection** | `Ctrl + Shift + T` | - | You still can move your camera around the scene with Right Click during this. |
| **Add New Point** | `V` | `Left Click` | Works the same as when you are building a wall and wants. |
| **Remove Last Point** | `Ctrl + Z` | `Midle Click` | Removing all points dosn't ends your selection. |
| **End Selection** | `Enter` | `Double Left Click` | Creates a tile based on the cropped area. You need atleast 3 points. |
| **Cancel Selection** | `Backspace` | - | Exit the selection without creating a tile. |

---

## Game Settings and Controls Configuration

### Tiles Directory
Path for where the images created by this module will go. Default is inside your current world folder.

### Format Selection
Choose in wich format the module will save images: PNG or Webp. Changing this setting won't change the format from already existing images.

### Mouse Controls
For what i've search, Foundry dosn't let modules configure mouse-based controls on Control Configuration so, i created this section to let you costumize the mouse settings as you please (kinda). For now, only "Add New Point", "End Selection" and "Remove Last Point" supports Left, Right and Middle clicks. Plus, "End Selection" always is a double click.

