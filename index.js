const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock

const bot = mineflayer.createBot({
    host: 'localhost',
    port: '56962',
    username: 'FirstBot'
})

bot.loadPlugin(pathfinder)

bot.on('chat', function(username, message) {
    console.log(username, ':', message);
})

function followPlayer() {
    const player = bot.players['Thug2000']

    if (!player) {
        bot.chat("Je ne peux pas voir ce joueur !")
        return
    }

    const mcData = require('minecraft-data')(bot.version)

    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = [mcData.blocksByName.Cobblestone.id, mcData.blocksByName.Dirt.id]

    bot.pathfinder.setMovements(movements)

    const goal = new GoalFollow(player.entity, 1)
    bot.pathfinder.setGoal(goal, true)
}

function locateDiamond() {

    const mcData = require('minecraft-data')(bot.version)

    const movements = new Movements(bot, mcData)

    bot.pathfinder.setMovements(movements)

    const diamondBlock = bot.findBlock({
        matching: mcData.blocksByName.diamond_ore.id,

        maxDistance: 128
    })

    if (!diamondBlock) {
        bot.chat('Il n ya pas de bloc de diamant à coté !')
        return
    }

    const x = diamondBlock.position.x
    const y = diamondBlock.position.y + 1
    const z = diamondBlock.position.z
    const goal = new GoalBlock(x, y, z)

    bot.pathfinder.setGoal(goal)
}

bot.once('spawn', locateDiamond)