// --- Element references ---
var canvas = document.querySelector("canvas");
const testImage = new Image();
testImage.src =
  "https://raw.githubusercontent.com/Iksfen/isaac-room-editor/dd7762e0398f649afcb59ab4150086fd256d5582/images/tileset.png";

var isMouseDown = false;
var rooms = [];
var new_room = { tiles: [] };

function dumpRooms() {
  if (rooms.length == 0) {
    console.log("There are no rooms");
  }
  var print = "";
  for (let i = 0; i < rooms.length; i++) {
    print += "\nRoom " + i.toString() + ":";
    for (let j = 0; j < rooms[i].tiles.length; j++) {
      print +=
        " (" +
        rooms[i].tiles[j][0].toString() +
        "," +
        rooms[i].tiles[j][1].toString() +
        ")";
    }
  }
  console.log(print);
}

function addNewTile(e) {
  [x, y] = getCoords(e);
  if (!isIn([x, y], new_room.tiles)) {
    new_room.tiles.push([x, y]);
    draw();
  }
}

function addNewRoom() {
  // remove the tiles that overlap with the new room
  new_room.tiles.forEach((tile) => {
    rooms.forEach((room) => {
      for (let i = 0; i < room.tiles.length; i++) {
        if (isSame(room.tiles[i], tile)) {
          room.tiles.splice(i, 1);
          break;
        }
      }
    });
  });
  rooms.push(new_room);
  console.log("BEFORE");
  dumpRooms();
  fixConnectivity();
  console.log("AFTER");
  dumpRooms();
  new_room = { tiles: [] };
  draw();
}

function fixConnectivity() {
  for (let i = 0; i < rooms.length; i++) {
    var tiles = rooms[i].tiles;
    if (tiles.length == 0) {
      rooms.splice(i, 1);
      i--;
    }
    if (tiles.length <= 1) continue;
    var was_at = new Array(tiles.length).fill(false);
    var visits_counter = 0;
    function wanderer(tile_id) {
      was_at[tile_id] = true;
      visits_counter++;
      var direction = [1, 0];
      for (let j = 0; j < 4; j++) {
        var neighbour = [
          tiles[tile_id][0] + direction[0],
          tiles[tile_id][1] + direction[1]
        ];
        for (let k = 0; k < tiles.length; k++) {
          if (!was_at[k] && isSame(neighbour, tiles[k])) {
            wanderer(k);
          }
        }
        direction = [direction[1], -direction[0]];
      }
    }
    wanderer(0);
    if (visits_counter < tiles.length) {
      var split_room = { tiles: [] };
      for (let j = 0; j < tiles.length; j++) {
        if (!was_at[j]) {
          split_room.tiles.push(tiles[j]);
          tiles.splice(j, 1);
          was_at.splice(j, 1);
          j--;
        }
      }
      rooms.push(split_room);
    }
  }
}

// --- Mouse bindings for canvas ---
canvas.addEventListener("mousedown", (event) => {
  isMouseDown = true;
  addNewTile(event);
});
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
  addNewRoom();
});
canvas.addEventListener("mouseleave", () => {
  if (isMouseDown) addNewRoom();
  isMouseDown = false;
});
canvas.addEventListener("mousemove", (event) => {
  if (isMouseDown) {
    addNewTile(event);
  }
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

function isSame(arr1, arr2) {
  return JSON.stringify(arr1) == JSON.stringify(arr2);
}

function isIn(arr, arr_of_arrs) {
  for (let i = 0; i < arr_of_arrs.length; i++) {
    if (isSame(arr, arr_of_arrs[i])) {
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
      var offset = [0, 0, 0, 0];
      var dPoz = [
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, 0]
      ];
      for (let i = 0; i < 4; i++) {
        var look_at = [tile[0] + dPoz[i][0], tile[1] + dPoz[i][1]];
        if (isIn(look_at, room.tiles)) {
          offset[i] = 1;
        }
      }
      var offsets_offset = 0;
      for (let i = 0; i < 4; i++) {
        offsets_offset *= 2;
        if (offset[i] == 1 && offset[(i + 3) % 4] == 1) {
          var diagonal = [
            tile[0] + dPoz[i][0] + dPoz[(i + 3) % 4][0],
            tile[1] + dPoz[i][1] + dPoz[(i + 3) % 4][1]
          ];
          if (isIn(diagonal, room.tiles)) {
            offsets_offset += 1;
          }
        }
      }
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
  new_room.tiles.forEach((tile) => {
    var offset = [0, 0, 0, 0];
    var dPoz = [
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 0]
    ];
    for (let i = 0; i < 4; i++) {
      var look_at = [tile[0] + dPoz[i][0], tile[1] + dPoz[i][1]];
      if (isIn(look_at, new_room.tiles)) {
        offset[i] = 1;
      }
    }
    var offsets_offset = 0;
    for (let i = 0; i < 4; i++) {
      offsets_offset *= 2;
      if (offset[i] == 1 && offset[(i + 3) % 4] == 1) {
        var diagonal = [
          tile[0] + dPoz[i][0] + dPoz[(i + 3) % 4][0],
          tile[1] + dPoz[i][1] + dPoz[(i + 3) % 4][1]
        ];
        if (isIn(diagonal, new_room.tiles)) {
          offsets_offset += 1;
        }
      }
    }
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
}

// --- Default map state ---
var defaultState = [
  { tiles: [[8, 8]] },
  {
    tiles: [
      [8, 7],
      [8, 6],
      [7, 7],
      [7, 6]
    ]
  },
  {
    tiles: [
      [9, 8],
      [10, 8]
    ]
  },
  {
    tiles: [
      [9, 6],
      [10, 6],
      [10, 5]
    ]
  }
];

// --- Initialize once tileset is loaded ---
testImage.onload = function () {
  //rooms = defaultState;
  draw();
};
