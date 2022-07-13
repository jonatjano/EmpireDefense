import AbstractEntity from "./AbstractEntity.js";

export default class Enemy extends AbstractEntity {
	style = Object.freeze({size: 40, color: "red"})

	constructor(x, y, life = 10) {
		super(x, y, 3, life)
	}

	act(timeSinceLastCall) {
		this.moveForward({x: this.x + 100, y: this.y}, timeSinceLastCall)

		if (globalThis.map.goals.find(el => el.x === Math.floor(this.x) && el.y === Math.floor(this.y))) {
			this.kill()
		}
	}
}