import Cell from "./Cell.js";

export default class PathFinder {
	/**
	 * @type {Map}
	 */
	#map

	/**
	 * @type { {[x: uint]: {[y: uint]: {x: uint, y: uint, cost: uint} } } }
	 */
	#paths

	/**
	 * @type { {x: uint, y: uint}[] }
	 */
	#criticalCells

	/**
	 * @param {Map} map
	 */
	constructor(map) {
		this.#map = map
	}

	act() {
		if (this.#map.needPathUpdate) {
			this.#paths = {}
			for (const goal of this.#map.goals) {
				this.#calculateBestPath(goal)
			}
			// this.#calculateCriticalCells(goal)
		}
	}

	/**
	 * @param {{x: uint, y: uint}} to
	 * @param {uint} cost
	 */
	#calculateBestPath(to, cost = 0) {

		const adjacent = [{x:-1, y:0}, {x:0, y:-1}, {x:1, y:0}, {x:0, y:1}]
			.map(delta => ({x: to.x + delta.x, y: to.y + delta.y}))

		for (const cellPos of adjacent) {
			const cell = this.#map.getCellAt(cellPos.x, cellPos.y)
			if (cell?.isWalkable) {
				if ((this.#paths[cellPos.x]?.[cellPos.y]?.cost ?? Infinity) > cost + 1) {
					this.#paths[cellPos.x] ??= {}
					this.#paths[cellPos.x][cellPos.y] = {...to, cost}
					this.#calculateBestPath(cellPos, cost + 1)
				}
			}
		}

	}

	/**
	 * @param { {x: uint, y: uint} } to
	 * @param { {[x: uint]: {[y: uint]: true } } } state
	 */
	#calculateIfConnectedToSpawn(to, state) {

		if (this.#map.getCellAt(to.x, to.y) === Cell.SPAWN) {
			return true
		}

		const adjacent = [{x:-1, y:0}, {x:0, y:-1}, {x:1, y:0}, {x:0, y:1}]
			.map(delta => ({x: to.x + delta.x, y: to.y + delta.y}))

		for (const cellPos of adjacent) {
			const cell = this.#map.getCellAt(cellPos.x, cellPos.y)
			if (cell?.isWalkable && state[cellPos.x]?.[cellPos.y] !== true) {
				state[cellPos.x] = {...state[cellPos.x], [cellPos.y]: true}
				if (this.#calculateIfConnectedToSpawn(cellPos, state)) {
					return true
				}
			}
		}

		return false
	}

	canBuildAt({x, y}) {
		for (const goal of this.#map.goals) {
			const prestate = {[x]: {[y]: true}}
			if (this.#calculateIfConnectedToSpawn(goal, prestate) === false) {
				return false
			}
		}
		return true
	}

	isCritical(x, y) {
		return this.#criticalCells.some(cell => cell.x === x && cell.y === y)
	}

	next(point) {
		const cellPos = this.#paths[Math.floor(point.x)][Math.floor(point.y)]
		return {x: cellPos.x + 0.5, y: cellPos.y + 0.5, cost: cellPos.cost, touchGoal: cellPos.touchGoal}
	}
}