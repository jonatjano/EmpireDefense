import utils from "./utils.js";
import Map from "./map/Map.js"
import draw from "./UI/draw.js";
import "./UI/events.js"
import {FlyingEnemy, GroundEnemy} from "./entity/enemyExport.js";

let lastLoop = 0
const MONSTER_INTERVAL = 2000

utils.canvas.preparedCanvasAndContext
globalThis.map = Map.fromDimensions(20, 10)
// console.log(globalThis.map.spawns)

const gameLoop = time => {
	const interval = time - lastLoop
	globalThis.map.pathfinder.act()

	globalThis.map.forEachUnit(unit => { unit.act(interval) })
	globalThis.map.forEachBuilding(building => { building.act(interval) })

	if (time % MONSTER_INTERVAL < lastLoop % MONSTER_INTERVAL || lastLoop === 0) {
		globalThis.map.addUnit(new GroundEnemy(globalThis.map.spawns[0].x + 0.5, globalThis.map.spawns[0].y + 0.5))
		globalThis.map.addUnit(new FlyingEnemy(globalThis.map.spawns[0].x + 0.5, globalThis.map.spawns[0].y + 0.5))
	}

	draw(globalThis.map)

	lastLoop = time
	requestAnimationFrame(gameLoop)
}
globalThis.map.addUnit(new FlyingEnemy(globalThis.map.spawns[0].x + 0.5, globalThis.map.spawns[0].y + 0.5))
gameLoop(0)

// board[2][2].build(Building.archerTower(2, 2))
// board[3][2].build(Building.archerTower(2, 3))
// board[4][2].build(Building.archerTower(2, 4))
// board[5][2].build(Building.archerTower(2, 5))
// board[6][1].build(Building.archerTower(1, 6))
// board[8][2].build(Building.archerTower(2, 8))
// globalThis.map.buildAt(20, 1, Building.ARCHER_TOWER)
/*
globalThis.map.buildAt(1, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(2, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(2, 5, Building.ARCHER_TOWER)
globalThis.map.buildAt(2, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(2, 3, Building.ARCHER_TOWER)
globalThis.map.buildAt(2, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(3, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(4, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(5, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(5, 5, Building.ARCHER_TOWER)
globalThis.map.buildAt(5, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(5, 3, Building.ARCHER_TOWER)
globalThis.map.buildAt(5, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(6, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(7, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(8, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(9, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(9, 3, Building.ARCHER_TOWER)
globalThis.map.buildAt(9, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(10, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(11, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(12, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(13, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 4, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 3, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 5, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(13, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(12, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(11, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(10, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(9, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 7, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 8, Building.ARCHER_TOWER)
globalThis.map.buildAt(14, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(8, 6, Building.ARCHER_TOWER)
globalThis.map.buildAt(8, 7, Building.ARCHER_TOWER)
globalThis.map.buildAt(8, 8, Building.ARCHER_TOWER)
globalThis.map.buildAt(8, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(7, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(6, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(4, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(5, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(3, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(2, 9, Building.ARCHER_TOWER)

globalThis.map.buildAt(15, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(16, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(17, 2, Building.ARCHER_TOWER)
globalThis.map.buildAt(15, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(16, 9, Building.ARCHER_TOWER)
globalThis.map.buildAt(17, 9, Building.ARCHER_TOWER)

*/