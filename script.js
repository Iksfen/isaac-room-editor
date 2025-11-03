// at top: keep existing querySelectors (script is deferred so DOM is ready)
var canvas = document.querySelector("canvas");
var tilesetContainer = document.querySelector(".tileset-container");
var tilesetSelection = document.querySelector(".tileset-container_selection");
var tilesetImage = document.querySelector("#tileset-source");

// ... your other code ...

// Handler for placing new tiles on the map
function addTile(mouseEvent) {
   // use the passed-in mouseEvent instead of relying on implicit 'event'
   var clicked = getCoords(mouseEvent);
   var key = clicked[0] + "-" + clicked[1];

   if (mouseEvent.shiftKey) {
      delete layers[currentLayer][key];
   } else {
      layers[currentLayer][key] = [selection[0], selection[1]];
   }
   draw();
}

// ... rest of your code ...

// Initialize app when tileset source is done loading
tilesetImage.onload = function() {
   layers = defaultState;
   draw();
   setLayer(0);
}

// Use the raw.githubusercontent.com URL (raw image)
// and ensure crossOrigin is set before .src
tilesetImage.crossOrigin = "anonymous";
tilesetImage.src = "https://raw.githubusercontent.com/Iksfen/isaac-room-editor/main/images/TileEditorSpritesheet.2x_2.png";
