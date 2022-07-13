'use strict';

const canvasDimension = {width: 2000, height: 1000}
let boardDimension = {width: 20, height: 10}
const units = new Set()
const buildings = new Set()
let lastLoop = 0
const specialCells = {spawns: new Set(), goals: new Set()}

function squaredDistanceBetween(p1, p2) {
	return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
}

class Entity {
	#x
	#y
	/**
	 * speed in cell per second
	 * @type {number}
	 */
	#speed
	#alive = true
	style = {size: 100, color: "black"}

	constructor(x, y, speed) {
		this.#x = x
		this.#y = y
		this.#speed = speed
	}

	act(timeSinceLastCall) {
		this.moveInDirectionOf(this, timeSinceLastCall)
	}

	moveInDirectionOf(target, timeSinceLastCall) {
		const angle = Math.atan2(target.y - this.#y, target.x - this.#x)
		const distance = Math.sqrt(squaredDistanceBetween(this, target))
		const finalDistance = Math.min(distance, timeSinceLastCall / 1000 * this.#speed)
		this.#x += Math.cos(angle) * finalDistance
		this.#y += Math.sin(angle) * finalDistance
	}

	get x() { return this.#x }
	get y() { return this.#y }

	kill() {
		units.delete(this)
		this.#alive = false
	}

	get isAlive() { return this.#alive }
}

class Enemy extends Entity {
	style = {size: 50, color: "red"}

	#life

	constructor(x, y, life = 10) {
		super(x, y, 3)
		this.#life = life
	}

	act(timeSinceLastCall) {
		this.moveInDirectionOf({x: this.x + 100, y: this.y}, timeSinceLastCall)

		if ([...specialCells.goals].find(el => el.x === Math.floor(this.x) && el.y === Math.floor(this.y))) {
			console.log("found the end")
			this.kill()
		}
	}
}

class Projectile extends Entity {
	style = {size: 20, color: "black"}
	#target

	constructor(x, y, target) {
		super(x, y, 100)
		this.#target = target
	}

	act(timeSinceLastCall) {
		if (this.#target.isAlive) {
			this.moveInDirectionOf(this.#target, timeSinceLastCall)
			if (squaredDistanceBetween(this.#target, this) < 0.05) {
				this.kill()
				this.#target.kill()
			}
			if (this.x < 0 || this.y < 0 || this.x > boardDimension.width + 2 || this.y > boardDimension.height + 2) {
				this.kill()
			}
		} else {
			this.kill()
		}
	}
}

/**
 * @callback BuildingAction
 * @param {Building} building
 * @param {uint} buildingLevel
 * @param {Enemy} target
 */

class Building {
	static #archerTowerTemplate = new Building(1, {}, function(tower, level, enemy) {
		units.add(new Projectile(tower.x + 0.5, tower.y + 0.5, enemy))
	}, 5000, 5, 5)

	static archerTower(x, y) {
		const tower = this.#archerTowerTemplate.clone()
		tower.#x = x
		tower.#y = y
		buildings.add(tower)
		return tower
	}

	/**
	 * @type {uint}
	 */
	#id
	/**
	 * @type {uint}
	 */
	#x
	/**
	 * @type {uint}
	 */
	#y
	/**
	 * @type { {body: string, head: string} }
	 */
	#images
	/**
	 * @type { BuildingAction }
	 */
	#action
	/**
	 * @type {uint}
	 */
	#coolDown
	/**
	 * @type {number}
	 */
	#range
	/**
	 * @type {uint}
	 */
	#cost
	/**
	 * @type {uint}
	 */
	#currentCharge = 0
	/**
	 * @type {uint}
	 */
	#level = 0

	/**
	 * @param {uint} id
	 * @param { {body: string, head: string} } images
	 * @param { BuildingAction } action
	 * @param {uint} coolDown
	 * @param {number} range
	 * @param {uint} cost
	 */
	constructor(id, images, action, coolDown, range, cost) {
		this.#id = id
		this.#images = images
		this.#action = action
		this.#coolDown = coolDown
		this.#range = range
		this.#cost = cost
	}

	/**
	 * @return {Building}
	 */
	clone() {
		return new Building(this.#id, this.#images, this.#action, this.#coolDown, this.#range, this.#cost)
	}

	act(timeSinceLastCall) {
		this.#currentCharge += timeSinceLastCall
		// console.log(this.inCoolDown)
		if (! this.inCoolDown) {
			const enemies = Building.enemiesInRange(this.#x, this.#y, this.#range)
			if (enemies.length !== 0) {
				while (! this.inCoolDown) {
					this.#action(this, this.#level, enemies[0])
					this.#currentCharge -= this.#coolDown
				}
			} else {
				this.#currentCharge = this.#coolDown
			}
		}
	}

	get inCoolDown() {
		return this.#coolDown > this.#currentCharge
	}
	get coolDownPercent() {
		return Math.min(1, this.#currentCharge / this.#coolDown)
	}

	get x() { return this.#x }
	get y() { return this.#y }

	static enemiesInRange(x, y, range) {
		const targets = []
		for (const unit of units) {
			if (unit instanceof Enemy && squaredDistanceBetween(unit, {x, y}) < (range + 0.5) ** 2) {
				targets.push(unit)
			}
		}
		return targets
	}
}

class Cell {
	static WALL = new Cell(false, false)
	static PATH = new Cell(true, false)
	static SPAWN(x, y) {
		const cell = new Cell(true, false)
		specialCells.spawns.add({x, y, cell})
		return cell
	}
	static GOAL(x, y) {
		const cell = new Cell(true, false)
		specialCells.goals.add({x, y, cell})
		return cell
	}

	/**
	 * @type {boolean}
	 */
	#walkable
	/**
	 * @type {boolean}
	 */
	#buildable
	/**
	 * @type {Building}
	 */
	#building = null

	constructor(walkable, buildable) {
		this.#walkable = walkable
		this.#buildable = buildable
	}

	get color() {
		if (this.#building) {
			if (this.#building.inCoolDown) {
				const percent = this.#building.coolDownPercent
				const red = Math.floor(255 * (1 - percent))
				const blue = Math.floor(255 * percent)
				console.log(`#${('0' + red.toString(16)).substr(-2)}00${('0' + blue.toString(16)).substr(-2)}`, red, blue, percent)
				return `#${('0' + red.toString(16)).substr(-2)}00${('0' + blue.toString(16)).substr(-2)}`
			} else {
				return "#0000FF"
			}
		}
		if (this.#walkable) {
			if (this.#buildable) {
				return "#88FF88"
			} else {
				return "#FFCC88"
			}
		} else {
			if (this.#buildable) {
				return "#AAAAAA"
			} else {
				return "#88CCFF"
			}
		}
	}

	get isBuildable() {
		return this.#buildable && this.#building === null
	}

	get isWalkable() {
		return this.#walkable && this.#building === null
	}

	build(building) {
		if (this.#building) { this.destroy() }
		this.#building = building
	}

	destroy() {
		buildings.delete(this.#building)
		this.#building = null
		console.log(buildings)
	}
}

const canvas = document.querySelector("canvas")
canvas.setAttribute("width", canvasDimension.width)
canvas.setAttribute("height", canvasDimension.height)

const ctx = canvas.getContext("2d")
let board = createBoard()

const gameLoop = time => {
	const interval = time - lastLoop
	for (const unit of units) {
		unit.act(interval)
	}
	for (const building of buildings) {
		building.act(interval)
	}
	if (time % 1000 < lastLoop % 1000 || lastLoop === 0) {
		units.add(new Enemy([...specialCells.spawns][0].x + 0.5, [...specialCells.spawns][0].y + 0.5))
	}

	drawCanvas(board)

	lastLoop = time
	requestAnimationFrame(gameLoop)
}
units.add(new Enemy([...specialCells.spawns][0].x + 0.5, [...specialCells.spawns][0].y + 0.5))
console.log(specialCells)
gameLoop(0)

/**
 * @return {Cell[][]}
 */
function createBoard() {
	const {width, height} = boardDimension
	const ret = []
	ret.push(Array(width + 2).fill(Cell.WALL))
	for (let i = 0; i < height; i++) {
		const subArray = [i === Math.floor(height/2)-1 ? Cell.SPAWN(0, i + 1) : Cell.WALL]
		for (let j = 0; j < width; j++) {
			// subArray.push(new Cell(i%2===0, j%2===0))
			subArray.push(new Cell(true, true))
		}
		subArray.push(i === Math.floor(height/2)-1 ? Cell.GOAL(width + 2, i + 1) : Cell.WALL)
		ret.push(subArray)
	}
	ret.push(Array(width + 2).fill(Cell.WALL))
	return ret
}

function drawCanvas(board) {
	const rectHeight = canvasDimension.height / (boardDimension.height + 2)
	const rectWidth = canvasDimension.width / (boardDimension.width + 2)

	// draw cell
	for (const i in board) {
		for (const j in board[i]) {
			ctx.fillStyle = board[i][j].color
			ctx.fillRect(rectWidth*j, rectHeight*i, rectWidth, rectHeight)
		}
	}

	// draw units
	for (const unit of units.values()) {
		const style = unit.style
		ctx.fillStyle = style.color
		ctx.fillRect(rectWidth * unit.x - style.size / 2, rectHeight * unit.y - style.size / 2, style.size, style.size)
	}

	// draw buildings
	// for (const i in board) {
	// 	for (const j in board[i]) {
	// 		ctx.fillStyle = board[i][j].color
	// 		ctx.fillRect(rectWidth*j, rectHeight*i, rectWidth, rectHeight)
	// 	}
	// }
}

canvas.addEventListener("click", event => {
	// console.log(event)
	// console.log(canvasDimension, boardDimension)
	// console.log(window.innerWidth, window.innerHeight)
	// console.log(event.x, event.y)
	// console.log(event.x / window.innerWidth, event.y / window.innerHeight)
	// console.log(event.x / window.innerWidth * (boardDimension.width + 2), event.y / window.innerHeight * (boardDimension.height + 2))
	const x = Math.floor(event.x / window.innerWidth * (boardDimension.width + 2))
	const y = Math.floor(event.y / window.innerHeight * (boardDimension.height + 2))
	const cell = board[y][x]
	if (cell.isBuildable) {
		cell.build(Building.archerTower(x, y))
	}
})

canvas.addEventListener("dblclick", event => {
	// console.log(event)
	// console.log(canvasDimension, boardDimension)
	// console.log(window.innerWidth, window.innerHeight)
	// console.log(event.x, event.y)
	// console.log(event.x / window.innerWidth, event.y / window.innerHeight)
	// console.log(event.x / window.innerWidth * (boardDimension.width + 2), event.y / window.innerHeight * (boardDimension.height + 2))
	const x = Math.floor(event.x / window.innerWidth * (boardDimension.width + 2))
	const y = Math.floor(event.y / window.innerHeight * (boardDimension.height + 2))
	board[y][x].destroy()
})

// board[2][2].build(Building.archerTower(2, 2))
// board[3][2].build(Building.archerTower(2, 3))
// board[4][2].build(Building.archerTower(2, 4))
// board[5][2].build(Building.archerTower(2, 5))
// board[6][1].build(Building.archerTower(1, 6))
// board[8][2].build(Building.archerTower(2, 8))
board[1][20].build(Building.archerTower(20, 1))