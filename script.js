var canvas = document.querySelector("canvas");
var tilesetContainer = document.querySelector(".tileset-container");
var tilesetSelection = document.querySelector(".tileset-container_selection");
var tilesetImage = document.querySelector("#tileset-source");

function addTile(mouseEvent) {
   var clicked = getCoords(mouseEvent);
   var key = clicked[0] + "-" + clicked[1];

   if (mouseEvent.shiftKey) {
      delete layers[currentLayer][key];
   } else {
      layers[currentLayer][key] = [selection[0], selection[1]];
   }
   draw();
}

tilesetImage.onload = function() {
   layers = defaultState;
   draw();
   setLayer(0);
}

tilesetImage.crossOrigin = "anonymous";
tilesetImage.src = "https://raw.githubusercontent.com/Iksfen/isaac-room-editor/main/images/TileEditorSpritesheet.2x_2.png";
