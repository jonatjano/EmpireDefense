import AbstractEntity from "./AbstractEntity.js";
import utils from "../utils.js";

export default class Projectile extends AbstractEntity {
	style = {size: 20, color: "black"}
	/**
	 * @type {AbstractEntity}
	 */
	#target
	/**
	 * @type {() => void}
	 */
	#onHit

	constructor(x, y, speed, target, onHit) {
		super(x, y, speed)
		this.#target = target
		this.#onHit = onHit
	}

	act(timeSinceLastCall) {
		if (this.#target.isAlive) {
			this.moveForward(this.#target, timeSinceLastCall)
			if (utils.math.squaredDistanceBetween(this.#target, this) < 0.05) {
				this.kill()
				this.#onHit(this.#target)
			}
			if (this.x < 0 || this.y < 0 || this.x > globalThis.map.width || this.y > globalThis.map.height) {
				this.kill()
			}
		} else {
			this.kill()
		}
	}
}