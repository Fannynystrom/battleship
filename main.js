
const rows = 10;
const cols = 10;
const nrOfShips = 1;

const player1 = {
  mark: 1,
  boms: [], 
  hits: [], 
  ships: [], 
};

const player2 = {
  mark: 2,
  boms: [],
  hits: [],
  ships: [],
};

// object to easily switch players
let players = { current: player1, enemy: player2 };

// DOM elements to manipulate
const display = document.querySelector("section.display");
const playerDisplay = document.querySelector(".display-player");
const tiles = Array.from(document.querySelectorAll(".tile"));
const announcer = document.querySelector(".announcer");
const button = document.querySelector("button");


// determine if val is primitive value (true/false)
function isPrimitive(val) {
  return ["number", "boolean", "string", "undefined"].includes(typeof val);
}

// determine if val is object value (true/false)
function isObject(val) {
  return typeof val === "object";
}


Object.prototype.equals = function (otherObj) {
  const thisKeys = Object.keys(this);
  const otherKeys = Object.keys(otherObj);
  if (thisKeys.length !== otherKeys.length) {
    return false;
  }
  for (let key of thisKeys) {
    const thisVal = this[key];
    const otherVal = otherObj[key];
    if (typeof thisVal !== "object") {
      if (thisVal !== otherVal) {
        return false;
      }
    } else {
      if (!thisVal.equals(otherVal)) {
        return false;
      }
    }
  }
  return true;
};


Array.prototype.contains = function (value) {
  if (isObject(value) && value.length === undefined) {
    for (let i = 0; i < this.length; i++) {
      if (value.equals(this[i])) {
        return true;
      }
    }
  }
  if (isPrimitive(value)) {
    return this.includes(value); // see if array has primitive value inside
  }
  return false;
};


function announce(message) {
  announcer.innerHTML = message;
  announcer.classList.remove("hide");
}


// clears DOM node messages (removes innerHTML) and removes it
// by adding .hide class
function clearAnnounce() {
  announcer.innerHTML =("");
  announcer.classList.add("hide");
}


//displays in DOM node playerDisplay the current players turn
function displayTurn(player) {
    playerDisplay.innerHTML = player.mark;
    playerDisplay.classList.remove('player1', 'player2');
    playerDisplay.classList.add(`player${player.mark}`);

}
// displayed in DOM node player.Display the winner and loser of the game const winnerStr = `Player <span class="display-player player${winner.mark}">${winner.mark}</span>`;
function displayGameOver(winner, loser) {
  const winnerStr = `Player <span class="display-player player${winner.mark}">${winner.mark}</span>`;
  const loserStr = ` wins over player <span class="display-player player${loser.mark}">${loser.mark}</span>`;
  display.innerHTML = winnerStr + loserStr;
  announce("Game Over");
}


function getCoordinates(tile) {
  const row = parseInt(tile.getAttribute('data-row'))
  const col = parseInt(tile.getAttribute('data-col'))


  return { row: row , col: col}
}


// given a tile (DOM node) clears that tile in grid
// gets rid of .player1 and .player2 classes as well as clears innerHTML
function clearTile(tile) {
  tile.innerHTML = "";
  tile.classList.remove("player1", "player2");

}

// clears the whole grid of with help of clearTile
function clearGrid() {
  for (let tile of tiles) {
    clearTile (tile);
    
  } 
  
}

function removeShip(ship) {
  for (let i = 0; i < tiles.length; i++) {
  const coord = getCoordinates(tiles[i])
    if (ship.contains (coord )){
      clearTile(tiles)
    }
  }
  }


// given a tile an mark (1, 2 or X) adds the mark on the tile
function addMark(tile, mark) {
  tile.innerHTML = mark;
  if (mark === player1.mark || mark === player2.mark) {
    tile.classList.add(`player${mark}`);
  } else if (mark === "X") {
    tile.classList.add(`bom`);
  }
  
}


// displays 1 on position (1, 2) and X on position (1, 3) in grid
function displayMarkersOnGrid(markers) {
  tiles.forEach((tile) => {
    const { row, col, } = getCoordinates(tile);
    for (let i = 0; i < markers.length; i++) {
      if (markers[i].row === row && markers[i].col === col){
        addMark(tile, markers[i].mark)
      }
    }
  });
   
}   
   

// given a player, display that players hits and boms array 
function displayHitsAndBoms(player) {
  clearGrid();
  const markedHits = player.hits.map((coord) => ({
    ...coord,
    mark: player.mark,
  }));
  const markedBoms = player.boms.map((coord) => ({
    ...coord,
    mark: "X",
  }));
  displayMarkersOnGrid([...markedHits, ...markedBoms]);
}

function glowShip(ship, ms) {
  tiles
    .filter((tile) => {
      const tileCoord = getCoordinates(tile);
      return ship.contains(tileCoord);
    })
    .forEach((tile) => {
      tile.classList.add("glow");
      setTimeout(() => {
        tile.classList.remove("glow");
      }, ms);
    });
}

///////////////////// Initialize ships //////////////////////////

// determines if a ship is a valid or not considering length and coordinates
function isValidShip(ship) {
 
  if (ship.length < 2 || ship.length > 5) {
    return false;
 
  } else { 
    const { row, col } = ship[0];
    return (
      ship.every((coord) => coord.row === row) ||
      ship.every((coord) => coord.col === col)
    )
  
  } 
}

// Ask both users for all their ships positions
function initializeShips(player, callback) {
  let shipCount = 0;
  let currentShip = [];
  displayTurn(player);
  announce(`Choose your remaining ${nrOfShips} ships!`);

  // event listener function
  function handleTileClick(evt) {
    const tile = evt.target;
    const coords = getCoordinates(tile);
    currentShip.push(coords);
    addMark(tile, player.mark);
  }

  // event listener function
  function handleAddShipClick() {
    if (isValidShip(currentShip)) {
      glowShip(currentShip, 1200);

      // register ship coordinates in players ships array
      player.ships = [...currentShip, ...player.ships];
      currentShip = []; 
      shipCount++; 
      announce(`Choose your remaining ${nrOfShips - shipCount} ships!`);

      // if all 5 ships have been registered
      if (shipCount === nrOfShips) {
        // recover grid and remove all added event listeners
        clearGrid();
        button.removeEventListener("click", handleAddShipClick);
        tiles.forEach((tile) =>
          tile.removeEventListener("click", handleTileClick)
        );
        callback(); 
      }
    } else {
      alert(`
      * Ships must be straigh lines
      * Each ship must be larger than 2 coordinates
      * Each ship must not be longer than 5 coordinates
      `);
      removeShip(currentShip); 
      currentShip = []; 
    }
  }

  //  event listeners
  button.addEventListener("click", handleAddShipClick);
  tiles.forEach((tile) => tile.addEventListener("click", handleTileClick));
}

//////////////////////// Game loop ////////////////////////////////

// adds mark (1, 2 or X) to coordinate object { row, col } => { row, col, mark }
function markCoord(coord, mark) {
  const newCoord = {...coord}
  newCoord.mark=mark;
    return newCoord;
 
}

// determines if player has lost (true/false)
function hasLost(player) {
  if (player.hits.length !== player.ships.length) {
    return false
  } else {
    return true
  }  
}

// adds guess coordinates { row, col } to either players hits or boms array
// depending on whether it hit or missed any of the players ships coordinates
function registerHitOrBom(guess, player) {
  const itsAHit = player.ships.some(ship => ship.row === guess.row && ship.col === guess.col);

  if (itsAHit) {
    player.hits.push(guess);
  } else {
    player.boms.push(guess);
  }
}


// switch players object around so that
// { current: p1, enemy: p2 } => { current: p2, enemy: p1 }
function switchPlayers(players) {
   const Players = {
    current: players.enemy,
    enemy: players.current
  };

  return Players;
}



// flag to determine if user has clicked at a tile
let targetChoosen = false;
// event listener function for "Next player" button
function handleNextPlayerClick() {
  // if user has clicked tile allow to run next loop
  if (targetChoosen) {
    targetChoosen = false; 
    gameLoop(); 
  } else {
    alert("You must choose a tile to shoot first");
  }
}

// stops game
function stopGame() {
  displayGameOver(players.current, players.enemy);
  button.innerHTML = "Restart";
  button.removeEventListener("click", handleNextPlayerClick);
  button.addEventListener("click", () => location.reload());
}

// event listener function for when tile is clicked by user
function handleTileClick(evt) {
  const guess = getCoordinates(evt.target); 
  registerHitOrBom(guess, players.enemy); // add guess to either enemy hits or boms array
  displayHitsAndBoms(players.enemy); // display all enemys hits and boms array
  // remove event listener from all tiles, so player cannot click any more tiles
  tiles.forEach((tile) => tile.removeEventListener("click", handleTileClick));
  if (hasLost(players.enemy)) {
    stopGame(); // current is winner, stop running game loop
  } else {
    players = switchPlayers(players);
    targetChoosen = true; // mark flag so that we know user has clicked on tile
  }
}

// game loop, main parts are
// * displays turn of current player
// * displays in grid enemys hits and boms,
function gameLoop() {
  displayTurn(players.current);
  displayHitsAndBoms(players.enemy);
  tiles.forEach((tile) => tile.addEventListener("click", handleTileClick));
}

///////////////////// Game start //////////////////////////

function runGame() {
  // initializeShips uses a player object to set up all ships, and when done calls the callback
  initializeShips(player1, () => {
    initializeShips(player2, () => {
      button.innerHTML = "Next player";
      button.addEventListener("click", handleNextPlayerClick);
      clearAnnounce();
      gameLoop();
    });
  });
}

 runGame();
