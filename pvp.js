const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock
const pvp = require('mineflayer-pvp').plugin
const toolPlugin = require('mineflayer-tool').plugin
const armorManager = require('mineflayer-armor-manager')



const bot = mineflayer.createBot({
    host: 'localhost',
    port: '62140',
    username: 'ThugRobot'
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)
bot.loadPlugin(toolPlugin)
bot.loadPlugin(armorManager)

let mcData
bot.once('spawn', () => {
    mcData = require('minecraft-data')(bot.version)
    bot.tool.chestLocations = bot.findBlocks({
        matching: mcData.blocksByName.chest.id,
        maxDistance: 16,
        count: 999
    })
})

bot.on('chat', (username, message) => {
    bot.armorManager.equipAll()

    if (username === bot.username) return

    if (message === 'fight me') {
        const player = bot.players[username]

        if (!player) {
            bot.chat('je ne peux pas vous voir !')
            return
        }

        bot.pvp.attack(player.entity)
    }

    if (message === 'stop') {
        bot.pvp.stop()
    }

    if (message.indexOf('drop') >= 0) {
        const msg = message.split(" ");
        const itemDrop = msg[1];

        dropItem(itemDrop)
    }

    if (message.indexOf('come') >= 0) {
        comeAtPlayer()
    }

    if (message.indexOf('say') >= 0) {
        const msg = message.replace('say', '');
        bot.chat(msg)
    }

    if (message.indexOf('find') >= 0) {
        const msg = message.split(" ")
        const blockDrop = msg[1]
        locateDiamond(blockDrop)
    }

    if (message.indexOf('bestTool') >= 0) {

        bestTool()
    }
})

function dropItem(item) {
    const items1 = bot.inventory.items() // get the items

    var countNo = 0;

    if (item === 'all') {
        const dropper = (i) => {
            if (!items1[i]) return // if we dropped all items, stop.
            bot.tossStack(items1[i], () => dropper(i + 1)) // drop the item, then wait for a response from the server and drop another one.
        }
        dropper(0)
    } else {
        for (let i = 0; i < Object.keys(items1).length; i++) {
            console.log(items1[i].type);

            if (items1[i].type === mcData.itemsByName[item].id) {
                bot.chat('J ai cet item !');
                bot.chat(mcData.itemsByName[item].id);
                bot.toss(mcData.itemsByName[item].id, null, Infinity);
            } else {
                countNo = countNo + 1;
            }

            if (countNo === Object.keys(items1).length) {
                bot.chat('je n ai pas cet item !')
            }
        }
    }
       
}

function comeAtPlayer() {
    const player = bot.players['Thug2000']

    if (!player) {
        bot.chat("Je ne peux pas voir ce joueur !")
        return
    }

    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = [mcData.blocksByName.cobblestone.id, mcData.blocksByName.dirt.id]

    bot.pathfinder.setMovements(movements)

    const goal = new GoalFollow(player.entity, 1)
    bot.pathfinder.setGoal(goal, false)
}

function locateDiamond(block) {

    const mcData = require('minecraft-data')(bot.version)

    const movements = new Movements(bot, mcData)

    bot.pathfinder.setMovements(movements)

    const diamondBlock = bot.findBlock({
        matching: mcData.blocksByName[block].id,

        maxDistance: 128
    })

    if (!diamondBlock) {
        bot.chat('Il n ya pas de bloc de ' + block + 'a 128 blocs autour !')
        return
    }

    const x = diamondBlock.position.x
    const y = diamondBlock.position.y + 1
    const z = diamondBlock.position.z
    const goal = new GoalBlock(x, y, z)

    bot.pathfinder.setGoal(goal)
}

function bestTool() {
    const player = bot.players['Thug2000']

    const blockPos = player.entity.position.offset(0, -1, 0)
    const block = bot.blockAt(blockPos)

    bot.tool.equipForBlock(block, {
        requireHarvest: true,
        getFromChest: true,
        maxTools: 3
    }, (err) => {
        if (err) {
            bot.chat(err.message)
            console.log(err)
        }
    })
}


//bot.on('spawn', () => {

//    setInterval(() => {

//        const mobFilter = e => e.type === "mob"
//        const mob = bot.nearestEntity(mobFilter)

//        if (!mob) {
//            bot.chat('Il n y a pas de mobs')
//            return
//        }

//        const pos = mob.position.offset(0, mob.height, 0);
//        bot.lookAt(pos, true, () => {
//            bot.attack(mob);
//        });

//    }, 1000);
//});

//function followPlayer() {

//    const mobFilter = e => e.type === "mob"  //ne selectionne que les mobs
//    const player = bot.players['Thug2000'] // bot.nearestEntity(mobFilter)

//    if (!player) {
//        bot.chat("Je ne peux pas voir ce joueur !")
//        return
//    }

//    const mcData = require('minecraft-data')(bot.version)

//    const movements = new Movements(bot, mcData)

//    bot.pathfinder.setMovements(movements)

//    const goal = new GoalFollow(player, 2)
//    bot.pathfinder.setGoal(goal, true)
//}

//bot.on('physicTick', followPlayer)
