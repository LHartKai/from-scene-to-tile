/**
 * From Scene to Tile
 * Foundry VTT v13 / v14
 *
 * Captures only the scene background image, clips it to a free-form polygon,
 * uploads a transparent PNG, and creates a Tile aligned to the selection.
 */

const MODULE_ID = "from-scene-to-tile";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "outputFolder", {
    name: game.i18n.localize("FROM_SCENE_TO_TILE.Settings.OutputFolder.Name"),
    hint: game.i18n.localize("FROM_SCENE_TO_TILE.Settings.OutputFolder.Hint"),
    scope: "world",
    config: true,
    type: String,
    default: `worlds/${game.world.id}/from-scene-to-tile`
  });
});

Hooks.once("ready", () => {
  game.keybindings.register(MODULE_ID, "startCapture", {
    name: game.i18n.localize("FROM_SCENE_TO_TILE.Controls.StartCapture"),
    hint: game.i18n.localize("FROM_SCENE_TO_TILE.Controls.StartCaptureHint"),
    editable: [{ key: "KeyT", modifiers: ["CONTROL", "SHIFT"] }],
    onDown: () => {
      if (!game.user.isGM) {
        ui.notifications.warn(game.i18n.localize("FROM_SCENE_TO_TILE.Errors.GMOnly"));
        return false;
      }
      void FromSceneToTile.start();
      return true;
    },
    restricted: true,
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });
});

class FromSceneToTile {
  static active = false;

  static localize(key) {
    return game.i18n.localize(`FROM_SCENE_TO_TILE.${key}`);
  }

  static notify(key) {
    ui.notifications.info(this.localize(key));
  }

  static getBackground() {
    // The source can be an ImageBitmap in Foundry v14.
    const sprite = canvas.primary?.background;
    const source = canvas.primary?.backgroundSource;
    const imageWidth = source?.width ?? source?.naturalWidth ?? source?.videoWidth;
    const imageHeight = source?.height ?? source?.naturalHeight ?? source?.videoHeight;

    if (!sprite || !source || !(imageWidth > 0) || !(imageHeight > 0)) {
      throw new Error(this.localize("Errors.NoBackground"));
    }

    // This first release deliberately rejects transformed backgrounds until
    // they have been validated with real v13/v14 scenes.
    if (sprite.rotation || sprite.skew?.x || sprite.skew?.y) {
      throw new Error(this.localize("Errors.UnsupportedTransform"));
    }

    const width = Number(sprite.width);
    const height = Number(sprite.height);
    if (!(width > 0) || !(height > 0)) {
      throw new Error(this.localize("Errors.InvalidDimensions"));
    }

    const anchorX = sprite.anchor?.x ?? 0.5;
    const anchorY = sprite.anchor?.y ?? 0.5;

    return {
      source,
      imageWidth,
      imageHeight,
      x: sprite.x - width * anchorX,
      y: sprite.y - height * anchorY,
      width,
      height,
      scaleX: imageWidth / width,
      scaleY: imageHeight / height
    };
  }

  static async start() {
    if (this.active) {
      ui.notifications.warn(this.localize("Errors.AlreadyActive"));
      return;
    }
    if (!canvas.ready || !canvas.scene) {
      ui.notifications.warn(this.localize("Errors.NoScene"));
      return;
    }
    if (!game.user.isGM) {
      ui.notifications.warn(this.localize("Errors.GMOnly"));
      return;
    }

    let background;
    try {
      background = this.getBackground();
    } catch (error) {
      console.error(`[${MODULE_ID}] Background inspection failed`, error);
      ui.notifications.error(error.message);
      return;
    }

    this.active = true;
    const scene = canvas.scene;
    const sceneId = scene.id;
    const view = canvas.app.view;
    const points = [];
    let cursor = null;
    let destroyed = false;

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      zIndex: "100000",
      pointerEvents: "none",
      overflow: "hidden"
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    Object.assign(svg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      overflow: "visible"
    });

    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("fill", "rgba(38,198,218,0.18)");
    polygon.setAttribute("stroke", "#26c6da");
    polygon.setAttribute("stroke-width", "2");
    polygon.setAttribute("stroke-dasharray", "6 3");
    polygon.setAttribute("stroke-linejoin", "round");

    const preview = document.createElementNS("http://www.w3.org/2000/svg", "line");
    preview.setAttribute("stroke", "#ffffff");
    preview.setAttribute("stroke-width", "2");
    preview.setAttribute("stroke-dasharray", "4 3");

    svg.append(polygon, preview);
    overlay.appendChild(svg);
    document.body.appendChild(overlay);

    const cleanup = () => {
      if (destroyed) return;
      destroyed = true;
      view.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("contextmenu", onContextMenu, true);
      view.style.cursor = "";
      overlay.remove();
      this.active = false;
    };

    const toScene = (event) => canvas.canvasCoordinatesFromClient({
      x: event.clientX,
      y: event.clientY
    });

    const redraw = () => {
      polygon.setAttribute("points", points.map(point =>
        `${point.screen.x},${point.screen.y}`
      ).join(" "));

      if (points.length && cursor) {
        const last = points.at(-1).screen;
        preview.setAttribute("x1", String(last.x));
        preview.setAttribute("y1", String(last.y));
        preview.setAttribute("x2", String(cursor.x));
        preview.setAttribute("y2", String(cursor.y));
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
      }
    };

    const cancel = () => {
      cleanup();
      this.notify("Messages.Cancelled");
    };

    const onPointerDown = (event) => {
      if (destroyed) return;

      if (event.button === 2) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (points.length >= 3) void complete();
        else cancel();
        return;
      }
      if (event.button !== 0) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const screen = { x: event.clientX, y: event.clientY };
      const scenePoint = toScene(event);

      // Clicking near the first vertex closes the polygon.
      if (points.length >= 3) {
        const first = points[0].screen;
        if (Math.hypot(screen.x - first.x, screen.y - first.y) <= 12) {
          void complete();
          return;
        }
      }

      points.push({ screen, scene: scenePoint });
      cursor = screen;
      redraw();
    };

    const onPointerMove = (event) => {
      if (destroyed) return;
      cursor = { x: event.clientX, y: event.clientY };
      redraw();
    };

    const onKeyDown = (event) => {
      if (destroyed) return;
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      } else if (event.key === "Backspace") {
        event.preventDefault();
        points.pop();
        redraw();
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (points.length >= 3) void complete();
        else ui.notifications.warn(this.localize("Errors.NeedThreePoints"));
      }
    };

    const onContextMenu = (event) => {
      if (destroyed) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (points.length >= 3) void complete();
      else cancel();
    };

    async function complete() {
      if (destroyed) return;
      if (points.length < 3) {
        ui.notifications.warn(FromSceneToTile.localize("Errors.NeedThreePoints"));
        return;
      }

      const selected = points.map(point => ({ ...point.scene }));
      cleanup();

      try {
        if (canvas.scene?.id !== sceneId) {
          throw new Error(FromSceneToTile.localize("Errors.SceneChanged"));
        }
        const current = FromSceneToTile.getBackground();
        if (current.source !== background.source) {
          throw new Error(FromSceneToTile.localize("Errors.BackgroundChanged"));
        }

        const imagePoints = selected.map(point => ({
          x: (point.x - background.x) * background.scaleX,
          y: (point.y - background.y) * background.scaleY
        }));

        const minX = Math.max(0, Math.floor(Math.min(...imagePoints.map(p => p.x))));
        const minY = Math.max(0, Math.floor(Math.min(...imagePoints.map(p => p.y))));
        const maxX = Math.min(background.imageWidth, Math.ceil(Math.max(...imagePoints.map(p => p.x))));
        const maxY = Math.min(background.imageHeight, Math.ceil(Math.max(...imagePoints.map(p => p.y))));
        const width = maxX - minX;
        const height = maxY - minY;

        if (width < 2 || height < 2) {
          throw new Error(FromSceneToTile.localize("Errors.SelectionOutsideBackground"));
        }

        const output = document.createElement("canvas");
        output.width = width;
        output.height = height;
        const context = output.getContext("2d", { alpha: true });
        if (!context) throw new Error(FromSceneToTile.localize("Errors.CanvasUnavailable"));

        context.beginPath();
        imagePoints.forEach((point, index) => {
          const x = point.x - minX;
          const y = point.y - minY;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.closePath();
        context.clip();
        context.drawImage(background.source, minX, minY, width, height, 0, 0, width, height);

        const blob = await new Promise((resolve, reject) => {
          output.toBlob(result => {
            if (result) resolve(result);
            else reject(new Error(FromSceneToTile.localize("Errors.ExportFailed")));
          }, "image/png");
        });

        const folder = String(game.settings.get(MODULE_ID, "outputFolder") || "")
          .trim().replace(/^\/+|\/+$/g, "");
        if (!folder) throw new Error(FromSceneToTile.localize("Errors.OutputFolderEmpty"));

        // FilePicker.upload expects a source such as "data" or "public",
        // not the core uploadDirectory setting's path value.
        const file = new File([blob], `polygon-${Date.now()}.png`, { type: "image/png" });
        let uploaded;
        try {
          uploaded = await FilePicker.upload("data", folder, file, {}, {});
        } catch (firstError) {
          console.warn(`[${MODULE_ID}] Upload to data source failed`, firstError);
          throw new Error(FromSceneToTile.localize("Errors.UploadFailed"));
        }

        if (!uploaded?.path) throw new Error(FromSceneToTile.localize("Errors.UploadFailed"));

        const tileX = background.x + minX / background.scaleX;
        const tileY = background.y + minY / background.scaleY;
        const tileWidth = width / background.scaleX;
        const tileHeight = height / background.scaleY;

        await scene.createEmbeddedDocuments("Tile", [{
          x: tileX,
          y: tileY,
          width: tileWidth,
          height: tileHeight,
          texture: { src: uploaded.path },
          overhead: false,
          hidden: false,
          locked: false,
          alpha: 1
        }]);

        ui.notifications.info(FromSceneToTile.localize("Messages.Success"));
      } catch (error) {
        console.error(`[${MODULE_ID}] Polygon capture failed`, error);
        ui.notifications.error(error?.message || FromSceneToTile.localize("Errors.Unexpected"));
      }
    }

    view.style.cursor = "crosshair";
    view.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    this.notify("Messages.Instructions");
  }
}

globalThis.FromSceneToTile = FromSceneToTile;
