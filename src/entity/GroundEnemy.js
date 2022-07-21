import Enemy from "./Enemy.js";

export default class GroundEnemy extends Enemy {
	style = Object.freeze({size: 40, color: "pink"})

	constructor(x, y, life = 10) {
		super(x, y, 3, 30)
	}

	act(timeSinceLastCall) {
		this.moveForward(globalThis.map.pathfinder.next(this), timeSinceLastCall)

		if (globalThis.map.goals.find(el => el.x === Math.floor(this.x) && el.y === Math.floor(this.y))) {
			this.kill()
		}
	}
}