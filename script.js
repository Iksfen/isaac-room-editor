// --- Element references ---
var canvas = document.querySelector("canvas");
var tilesetContainer = document.querySelector(".tileset-container");
var tilesetSelection = document.querySelector(".tileset-container_selection");
const testImage = new Image();
testImage.src = "https://raw.githubusercontent.com/Iksfen/isaac-room-editor/dd7762e0398f649afcb59ab4150086fd256d5582/images/tileset.png";

// --- State ---
var selection = [0, 0]; // Which tile to paint from the tileset
var isMouseDown = false;
var rooms = [];

// --- Select tile from the tileset ---
tilesetContainer.addEventListener("mousedown", (event) => {
   selection = getCoords(event);
   tilesetSelection.style.left = selection[0] * 32 + "px";
   tilesetSelection.style.top = selection[1] * 32 + "px";
});

// --- Add or remove tile ---
//function addTile(mouseEvent) {
//   draw();
//}

// --- Mouse bindings for canvas ---
canvas.addEventListener("mousedown", (event) => {
   isMouseDown = true;
   //addTile(event);
});
canvas.addEventListener("mouseup", () => {
   isMouseDown = false;
});
canvas.addEventListener("mouseleave", () => {
   isMouseDown = false;
});
canvas.addEventListener("mousemove", (event) => {
   //if (isMouseDown) addTile(event);
});

// --- Get tile grid coordinates from mouse click ---
function getCoords(e) {
   const rect = e.target.getBoundingClientRect();
   const mouseX = e.clientX - rect.left;
   const mouseY = e.clientY - rect.top;
   return [Math.floor(mouseX / 32), Math.floor(mouseY / 32)];
}

// --- Export canvas as image in new tab ---
function exportImage() {
   var data = canvas.toDataURL();
   var image = new Image();
   image.src = data;

   var w = window.open("");
   w.document.write(image.outerHTML);
}

// --- Clear canvas and reset layers ---
function clearCanvas() {
   rooms = [];
   draw();
}

function isIn(arr, arr_of_arrs) {
   for (let i = 0; i < arr_of_arrs.length; i++) {
      if (JSON.stringify(arr) == JSON.stringify(arr_of_arrs[i])) {
         return true;
      }
   }
   return false;
}

// --- Draw all layers ---
function draw() {
   var ctx = canvas.getContext("2d");
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   var size = 32;
   rooms.forEach((room) => {
      room.tiles.forEach((tile) => {
        var offset = [0,0,0,0];
        var dPoz = [[0,1],[-1,0],[0,-1],[1,0]];
        for (let i = 0; i < 4; i++) {
           var look_at = [tile[0]+dPoz[i][0],tile[1]+dPoz[i][1]];
           if (isIn(look_at,room.tiles)) {
              offset[i] = 1;
           }
        };
        var offsets_offset = 0;
        for (let i = 0; i < 4; i++) {
           offsets_offset *= 2;
           if (offset[i] == 1 && offset[(i+3) % 4] == 1) {
              var diagonal = [tile[0]+dPoz[i][0]+dPoz[(i+3) % 4][0],tile[1]+dPoz[i][1]+dPoz[(i+3) % 4][1]];
              if (isIn(diagonal,room.tiles)) {
                 offsets_offset += 1;
              }
           }
        };
        offset = offset[3] + 2 * (offset[2] + 2 * (offset[1] + 2 * offset[0]));
        ctx.drawImage(
            testImage,
            offsets_offset * size,
            offset * size,
            size,
            size,
            tile[0] * size,
            tile[1] * size,
            size,
            size
        );
      });
   });
}

// --- Default map state ---
var defaultState = [{tiles:[[8,8]]},{tiles:[[8,7],[8,6],[7,7],[7,6]]},{tiles:[[9,8],[10,8]]},{tiles:[[9,6],[10,6],[10,5]]}];

// --- Initialize once tileset is loaded ---
testImage.onload = function() {
   rooms = defaultState;
   draw();
};
