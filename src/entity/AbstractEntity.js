import utils from "../utils.js";

export default class AbstractEntity {
	/**
	 * @type {number}
	 */
	#x
	/**
	 * @type {number}
	 */
	#y
	/**
	 * speed in cell per second
	 * @type {number}
	 */
	#speed
	/**
	 * @type {uint}
	 */
	#life
	/**
	 * @type { {size: number, color: string} }
	 */
	style = Object.freeze({size: 100, color: "black"})

	constructor(x, y, speed, life = 1) {
		this.#x = x
		this.#y = y
		this.#speed = speed
		this.#life = life
	}

	act(timeSinceLastCall) {
		this.moveForward(this, timeSinceLastCall)
	}

	moveForward(target, timeSinceLastCall) {
		const angle = utils.math.angleBetween(this, target)
		const distance = Math.min(
			utils.math.distanceBetween(this, target),
			timeSinceLastCall / 1000 * this.#speed
		)
		this.#x += Math.cos(angle) * distance
		this.#y += Math.sin(angle) * distance
	}

	get x() { return this.#x }
	get y() { return this.#y }

	kill() {
		this.hit(Infinity)
	}

	/**
	 * @param {uint} damage
	 */
	hit(damage) {
		this.#life -= damage
		if (! this.isAlive) {
			globalThis.map.deleteUnit(this)
		}
	}

	get isAlive() { return this.#life > 0 }

	get life() { return this.#life }
}