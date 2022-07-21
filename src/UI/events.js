import utils from "../utils.js";
import Building from "../Building.js";

let currentBuilding = Building.ARCHER_TOWER

utils.canvas.canvas.addEventListener("click", event => {
	// console.log(event)
	// console.log(canvasDimension, boardDimension)
	// console.log(window.innerWidth, window.innerHeight)
	// console.log(event.x, event.y)
	// console.log(event.x / window.innerWidth, event.y / window.innerHeight)
	// console.log(event.x / window.innerWidth * (boardDimension.width + 2), event.y / window.innerHeight * (boardDimension.height + 2))
	const {x, y} = utils.other.screenToMapCell(event)
	const cell = globalThis.map.getCellAt(x, y)
	globalThis.map.buildAt(x, y, currentBuilding)
})

utils.canvas.canvas.addEventListener("dblclick", event => {
	// console.log(event)
	// console.log(canvasDimension, boardDimension)
	// console.log(window.innerWidth, window.innerHeight)
	// console.log(event.x, event.y)
	// console.log(event.x / window.innerWidth, event.y / window.innerHeight)
	// console.log(event.x / window.innerWidth * (boardDimension.width + 2), event.y / window.innerHeight * (boardDimension.height + 2))
	const {x, y} = utils.other.screenToMapCell(event)
	globalThis.map.destroyAt(x, y)
})

utils.canvas.canvas.addEventListener("auxclick", event => {
	currentBuilding = Building.list[(Building.list.findIndex(a => a === currentBuilding) + 1) % Building.list.length]
	console.log(currentBuilding)
})

utils.canvas.canvas.addEventListener("resize", event => {
	utils.canvas.changeInnerDimensionToOuter()
})