import utils from "./utils.js";
import Projectile from "./entity/Projectile.js";
import Enemy from "./entity/Enemy.js";

/**
 * @typedef {AbstractEntity | Building} targetType
 */
/**
 * @callback BuildingAction
 * @param {Building} building
 * @param {uint} buildingLevel
 * @param { targetType[] } targets
 * @param {BuildingBoost} boost
 */
/**
 * @callback BuildingByLevelValue
 * @param {uint} buildingLevel
 * @return {uint}
 */

class BuildingBoost {
	constructor(duration, {rangeMultiplier, speedMultiplier, projectileSpeedMultiplier}) {
		this.duration = duration
		this.rangeMultiplier = rangeMultiplier ?? 1
		this.speedMultiplier = speedMultiplier ?? 1
		this.projectileSpeedMultiplier = projectileSpeedMultiplier ?? 1
	}
}


export default class Building {
	static ARCHER_TOWER = Object.freeze(
		new Building(1, {body: "FF0000", head: "0000FF"}, Enemy, function(tower, level, enemies, boost) {
			globalThis.map.addUnit(new Projectile(tower.x + 0.5, tower.y + 0.5, 20 * boost.projectileSpeedMultiplier, enemies[0], target => target.hit(level + 1)))
		}, _ => 500, _ => 5, 5)
	)
	static RANGE_BOOSTER_TOWER = Object.freeze(
		new Building(2, {body: "FF00FF", head: "FFFF00"}, Building, function(tower, level, buildings) {
			for (const building of buildings) {
				building.boost(this,
					new BuildingBoost(200, {rangeMultiplier: 2 + level, projectileSpeedMultiplier: 2 + level})
				)
			}
		}, _ => 100, _ => 1, 5)
	)

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
	 * @type { targetType }
	 */
	#targetType
	/**
	 * @type { BuildingAction }
	 */
	#action
	/**
	 * @type { BuildingByLevelValue }
	 */
	#coolDown
	/**
	 * @type { BuildingByLevelValue }
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
	 * @type {Map<Object, BuildingBoost>}
	 */
	#boosts = new Map()

	/**
	 * @param {uint} id
	 * @param { {body: string, head: string} } images
	 * @param { targetType } targetType
	 * @param { BuildingAction } action
	 * @param { BuildingByLevelValue } coolDown
	 * @param { BuildingByLevelValue } range
	 * @param {uint} cost
	 */
	constructor(id, images, targetType, action, coolDown, range, cost) {
		this.#id = id
		this.#images = Object.freeze(images)
		this.#targetType = targetType
		this.#action = action
		this.#coolDown = coolDown
		this.#range = range
		this.#cost = cost
	}

	/**
	 * @return {Building}
	 */
	clone(x, y) {
		const clone = new Building(this.#id, this.#images, this.#targetType, this.#action, this.#coolDown, this.#range, this.#cost)
		clone.#x = x
		clone.#y = y
		return clone
	}

	act(timeSinceLastCall) {
		let effective = new BuildingBoost(0, {})
		for (const [source, boost] of this.#boosts.entries()) {
			boost.duration -= timeSinceLastCall
			if (boost.duration <= 0) {
				this.#boosts.delete(source)
			} else {
				effective.speedMultiplier *= boost.speedMultiplier
				effective.rangeMultiplier *= boost.rangeMultiplier
				effective.projectileSpeedMultiplier *= boost.projectileSpeedMultiplier
			}
		}
		this.#currentCharge += timeSinceLastCall * effective.speedMultiplier
		if (! this.inCoolDown) {
			let targets
			switch (this.#targetType) {
				case Building:
					targets = globalThis.map.buildingsInRange(this, this.#range(this.#level) * effective.rangeMultiplier + 0.5).filter(target => target.#id !== this.#id)
					break
				default:
					targets = globalThis.map.unitsInRange(this, this.#range(this.#level) * effective.rangeMultiplier + 0.5, this.#targetType)
			}
			if (targets.length !== 0) {
				while (! this.inCoolDown) {
					this.#action(this, this.#level, targets, effective)
					this.#currentCharge -= this.#coolDown(this.#level)
				}
			} else {
				this.#currentCharge = this.#coolDown(this.#level)
			}
		}
	}

	boost(source, boost) {
		this.#boosts.set(source, boost)
	}

	get inCoolDown() {
		return this.#coolDown(this.#level) > this.#currentCharge
	}
	get coolDownPercent() {
		return Math.min(1, this.#currentCharge / this.#coolDown(this.#level))
	}

	get x() { return this.#x }
	get y() { return this.#y }
	get images() { return this.#images }
}