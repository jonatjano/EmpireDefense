let canvas = null
let context2D = null
const canvasDimensions = {height: 0, width: 0}

export default {
	math: {
		squaredDistanceBetween(p1, p2)
		{
			return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
		},
		distanceBetween(p1, p2)
		{
			return Math.sqrt(this.squaredDistanceBetween(p1, p2))
		},
		angleBetween(p1, p2) {
			return Math.atan2(p2.y - p1.y, p2.x - p1.x)
		},
		inRange(p1, p2, range) {
			return this.squaredDistanceBetween(p1, p2) < range ** 2
		}
	},
	canvas: {
		/**
		 * @return {HTMLCanvasElement}
		 */
		get canvas() {
			if (! canvas) {
				canvas = document.querySelector("canvas")
				canvasDimensions.width = canvas.getAttribute("width")
				canvasDimensions.height = canvas.getAttribute("height")
			}
			return canvas
		},
		/**
		 * @return {CanvasRenderingContext2D}
		 */
		get context2d() {
			context2D ??= this.canvas.getContext("2d")
			return context2D
		},
		/**
		 * @return {void}
		 */
		changeInnerDimensionToOuter() {
			const canvas = this.canvas
			const {width, height} = canvas.getBoundingClientRect()
			canvas.setAttribute("width", width + "px")
			canvas.setAttribute("height", height + "px")
			canvasDimensions.width = width
			canvasDimensions.height = height
			context2D = this.canvas.getContext("2d")
		},
		/**
		 * @return {{context2d: CanvasRenderingContext2D, canvas: HTMLCanvasElement}}
		 */
		get preparedCanvasAndContext() {
			this.changeInnerDimensionToOuter()
			return {canvas: this.canvas, context2d: this.context2d}
		},
		/**
		 * @return {uint}
		 */
		get width() {
			return canvasDimensions.width
		},
		/**
		 * @return {uint}
		 */
		get height() {
			return canvasDimensions.height
		}
	},
	other: {
		screenToMapCell(pos) {
			return {
				x: Math.floor(pos.x / window.innerWidth * globalThis.map.width),
				y: Math.floor(pos.y / window.innerHeight * globalThis.map.height)
			}
		},
		screenToMapPosition(pos) {
			return {
				x: pos.x / window.innerWidth * globalThis.map.width,
				y: pos.y / window.innerHeight * globalThis.map.height
			}
		}
	}
}