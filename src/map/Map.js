import Cell from "./Cell.js";
import AbstractEntity from "../entity/AbstractEntity.js";
import utils from "../utils.js";
import PathFinder from "./Pathfinder.js";
import GroundEnemy from "../entity/GroundEnemy.js";

export default class Map {
	/**
	 * @type {Cell[][]}
	 */
	#board
	/**
	 * @type {uint}
	 */
	#height
	/**
	 * @type {uint}
	 */
	#width

	/**
	 * @type { {x: uint, y: uint}[] }
	 */
	#spawns = []
	/**
	 * @type { {x: uint, y: uint}[] }
	 */
	#goals = []

	/**
	 * @type { Set<AbstractEntity> }
	 */
	#units = new Set()
	/**
	 * @type { Set<Building> }
	 */
	#buildings = new Set()
	/**
	 * flag to indicate when pathfinding must be recalculated
	 * @type {boolean}
	 */
	#needPathUpdate = true
	#pathfinder

	/**
	 * use {@link Map.fromBoard} for input validation
	 * @param {Cell[][]} board
	 */
	constructor(board) {
		this.#board = board
		this.#height = this.#board.length
		this.#width = this.#board[0].length

		for (let i = 0; i < this.#height; i++) {
			for (let j = 0; j < this.#width; j++) {
				if (this.#board[i][j] === Cell.SPAWN) {
					this.#spawns.push({x:j, y:i})
				}
				if (this.#board[i][j] === Cell.GOAL) {
					this.#goals.push({x:j, y:i})
				}
			}
		}

		Object.freeze(this.#spawns)
		Object.freeze(this.#goals)
		this.#pathfinder = new PathFinder(this)
	}

	get spawns() { return this.#spawns }
	get goals() { return this.#goals }
	get height() { return this.#height }
	get width() { return this.#width }
	get pathfinder() { return this.#pathfinder }

	get needPathUpdate() {
		const ret = this.#needPathUpdate
		this.#needPathUpdate = false
		return ret
	}

	getCellAt(x, y) { return this.#board?.[y]?.[x] }

	addUnit(unit) {
		this.#units.add(unit)
	}
	deleteUnit(unit) {
		this.#units.delete(unit)
	}
	forEachUnit(callback) {
		this.#units.forEach(callback)
	}
	unitsInRange(p1, range, unitType = AbstractEntity) {
		const targets = []
		for (const unit of this.#units) {
			if (unit instanceof unitType && utils.math.inRange(p1, unit, range)) {
				targets.push(unit)
			}
		}
		return targets
	}
	unitsInRangeWithDistance(p1, range, unitType = AbstractEntity) {
		const targets = []
		for (const unit of this.#units) {
			if (unit instanceof unitType) {
				const distance = utils.math.distanceBetween(p1, unit)
				if (distance < range) {
					targets.push({distance, unit})
				}
			}
		}
		return targets
	}
	unitsInRangeWithSquaredDistance(p1, range, unitType = AbstractEntity) {
		const targets = []
		for (const unit of this.#units) {
			if (unit instanceof unitType) {
				const squaredDistance = utils.math.squaredDistanceBetween(p1, unit)
				if (squaredDistance < range ** 2) {
					targets.push({squaredDistance, unit})
				}
			}
		}
		return targets
	}

	buildAt(x, y, template) {
		const cell = this.#board[y][x]
		const groundUnitOnCell = [...this.#units].some(unit => unit instanceof GroundEnemy && Math.floor(unit.x) === x && Math.floor(unit.y) === y)
		if (cell.isBuildable && ! groundUnitOnCell) {
			const building = template.clone(x, y)
			cell.build(building)
			this.addBuilding(building)
			this.#needPathUpdate = true
		}
	}
	destroyAt(x, y) {
		this.deleteBuilding(this.#board[y][x].destroy())
		this.#needPathUpdate = true
	}
	addBuilding(building) {
		this.#buildings.add(building)
	}
	deleteBuilding(building) {
		this.#buildings.delete(building)
	}
	forEachBuilding(callback) {
		this.#buildings.forEach(callback)
	}
	buildingsInRange(p1, range) {
		const targets = []
		for (const building of this.#buildings) {
			if (utils.math.inRange(p1, building, range)) {
				targets.push(building)
			}
		}
		return targets
	}
	buildingsInRangeWithDistance(p1, range) {
		const targets = []
		for (const building of this.#buildings) {
			const distance = utils.math.distanceBetween(p1, building)
			if (distance < range) {
				targets.push({distance, building})
			}
		}
		return targets
	}
	buildingsInRangeWithSquaredDistance(p1, range) {
		const targets = []
		for (const building of this.#buildings) {
			const squaredDistance = utils.math.squaredDistanceBetween(p1, building)
			if (squaredDistance < range) {
				targets.push({squaredDistance, building})
			}
		}
		return targets
	}

	/**
	 * @param {uint} width
	 * @param {uint} height
	 * @return {Map}
	 */
	static fromDimensions(width, height) {
		const board = []
		board.push(Array(width + 2).fill(Cell.WALL))
		for (let i = 0; i < height; i++) {
			// const subArray = [i === Math.floor(height/2)-1 || i === 8 || i === 1 ? Cell.SPAWN : Cell.WALL]
			const subArray = [i === Math.floor(height/2)-1 ? Cell.SPAWN : Cell.WALL]
			for (let j = 0; j < width; j++) {
				// subArray.push(new Cell(j !== 5 || (i > 1 && i < 4), true))
				subArray.push(new Cell(true, true))
			}
			// subArray.push(i === Math.floor(height/2)-1 || i === 8 || i === 1 ? Cell.GOAL : Cell.WALL)
			subArray.push(i === Math.floor(height/2)-1 ? Cell.GOAL : Cell.WALL)
			board.push(subArray)
		}
		board.push(Array(width + 2).fill(Cell.WALL))
		return this.fromBoard(board)
	}

	/**
	 * @param {Cell[][]} board
	 * @return {Map}
	 */
	static fromBoard(board) {
		// ensure board is a rectangle
		const height = board.length
		if (height === 0) {
			throw new TypeError("Board shouldn't be empty")
		}
		const width = board[0].length
		for (let i = 0; i < height; i++) {
			if (board[i].length !== width) {
				throw new TypeError("Board should be rectangular")
			}
		}

		// ensure board is surrounded by un-buildable cells
		for (let i = 0; i < height; i++) {
			if (i === 0 || i === height - 1) {
				for (let j = 0; j < width; j++) {
					if (board[i][j].isBuildable) {
						throw new TypeError("Board borders should be not buildable")
					}
				}
			} else {
				if (board[i][0].isBuildable || board[i].at(-1).isBuildable) {
					throw new TypeError("Board borders should be not buildable")
				}
			}
		}

		let hasSpawn = false
		let hasGoal = false
		for (let i = 0; i < height && (hasSpawn === false || hasGoal === false); i++) {
			for (let j = 0; j < width && (hasSpawn === false || hasGoal === false); j++) {
				if (board[i][j] === Cell.SPAWN) { hasSpawn = true }
				if (board[i][j] === Cell.GOAL) { hasGoal = true }
			}
		}
		if (! hasSpawn) {
			throw new TypeError("Board should have at least one spawn")
		}
		if (! hasGoal) {
			throw new TypeError("Board should have at least one goal")
		}

		return new Map(board)
	}
}