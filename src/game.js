import utils from "./utils.js";
import Enemy from "./entity/Enemy.js";
import Building from "./Building.js";
import Map from "./map/Map.js"
import draw from "./UI/draw.js";
import "./UI/events.js"

let lastLoop = 0

utils.canvas.preparedCanvasAndContext
globalThis.map = Map.fromDimensions(20, 10)
// console.log(globalThis.map.spawns)

const gameLoop = time => {
	const interval = time - lastLoop
	globalThis.map.forEachUnit(unit => { unit.act(interval) })
	globalThis.map.forEachBuilding(building => { building.act(interval) })

	if (time % 1000 < lastLoop % 1000 || lastLoop === 0) {
		globalThis.map.addUnit(new Enemy(globalThis.map.spawns[0].x + 0.5, globalThis.map.spawns[0].y + 0.5))
	}

	draw(globalThis.map)

	lastLoop = time
	requestAnimationFrame(gameLoop)
}
globalThis.map.addUnit(new Enemy(globalThis.map.spawns[0].x + 0.5, globalThis.map.spawns[0].y + 0.5))
gameLoop(0)

// board[2][2].build(Building.archerTower(2, 2))
// board[3][2].build(Building.archerTower(2, 3))
// board[4][2].build(Building.archerTower(2, 4))
// board[5][2].build(Building.archerTower(2, 5))
// board[6][1].build(Building.archerTower(1, 6))
// board[8][2].build(Building.archerTower(2, 8))
globalThis.map.buildAt(20, 1, Building.ARCHER_TOWER)