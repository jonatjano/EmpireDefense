export default class Cell {
	static WALL = new Cell(false, false)
	static PATH = new Cell(true, false)
	static SPAWN = new Cell(true, false)
	static GOAL = new Cell(true, false)

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
				const waiting = this.#building.images.body
				const ready = this.#building.images.head

				const waitingComp = {r: parseInt(waiting.substring(0, 2), 16), g: parseInt(waiting.substring(2, 4), 16), b: parseInt(waiting.substring(4, 6), 16)}
				const readyComp = {r: parseInt(ready.substring(0, 2), 16), g: parseInt(ready.substring(2, 4), 16), b: parseInt(ready.substring(4, 6), 16)}

				const finalComp = {
					r: Math.floor(waitingComp.r - (waitingComp.r - readyComp.r) * percent),
					g: Math.floor(waitingComp.g - (waitingComp.g - readyComp.g) * percent),
					b: Math.floor(waitingComp.b - (waitingComp.b - readyComp.b) * percent),
				}
				// console.log(waitingComp, readyComp, percent, finalComp, `#${('0' + finalComp.r.toString(16)).substr(-2)}${('0' + finalComp.g.toString(16)).substr(-2)}${('0' + finalComp.b.toString(16)).substr(-2)}`)
				return `#${('0' + finalComp.r.toString(16)).substr(-2)}${('0' + finalComp.g.toString(16)).substr(-2)}${('0' + finalComp.b.toString(16)).substr(-2)}`
			} else {
				return `#${this.#building.images.head}`
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
		const building = this.#building
		this.#building = null
		return building
	}
}