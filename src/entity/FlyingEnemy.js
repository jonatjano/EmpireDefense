import Enemy from "./Enemy.js";

export default class FlyingEnemy extends Enemy {
	style = Object.freeze({size: 10, color: "cyan"})

	constructor(x, y, life = 10) {
		super(x, y, 4, 10)
	}
}