import utils from "../utils.js";

export default function(map) {
	const rectHeight = utils.canvas.height / globalThis.map.height
	const rectWidth = utils.canvas.width / globalThis.map.width

	const ctx = utils.canvas.context2d
	// draw cell
	for (let i = 0; i < map.width; i++) {
		for (let j = 0; j < map.height; j++) {
			const cell = map.getCellAt(i, j)
			ctx.fillStyle = cell.color
			ctx.fillRect(rectWidth*i, rectHeight*j, rectWidth, rectHeight)
		}
	}

	// draw units
	globalThis.map.forEachUnit(unit => {
		const style = unit.style
		ctx.fillStyle = style.color
		ctx.fillRect(rectWidth * unit.x - style.size / 2, rectHeight * unit.y - style.size / 2, style.size, style.size)
		ctx.fillStyle = "black"
		ctx.font = `${rectHeight * 0.7}px ubuntu`
		ctx.textBaseline = "middle"
		ctx.textAlign = "center"
		ctx.fillText(unit.life, rectWidth * unit.x, rectHeight * unit.y)
	})

	// draw buildings
	// for (const i in board) {
	// 	for (const j in board[i]) {
	// 		ctx.fillStyle = board[i][j].color
	// 		ctx.fillRect(rectWidth*j, rectHeight*i, rectWidth, rectHeight)
	// 	}
	// }
}