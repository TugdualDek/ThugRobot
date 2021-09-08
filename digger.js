const mineflayer = require('mineflayer')
const vec3 = require('vec3')


const bot = mineflayer.createBot({
    host: 'localhost',
    port: '61044',
    username: 'digger'
})

bot.on('chat', async (username, message) => {
    if (username === bot.username) return
    switch (message) {
        case 'loaded':
            await bot.waitForChunksToLoad()
            bot.chat('Ready!')
            break
        case 'list':
            sayItems()
            break
        case 'dig':
            dig()
            break
        case 'build':
            build()
            break
        case 'equip dirt':
            equipDirt()
            break
    }
})

function sayItems(items = bot.inventory.items()) {
    const output = items.map(itemToString).join(', ')
    if (output) {
        bot.chat(output)
    } else {
        bot.chat('empty')
    }
}

function dig() {
    let target
    if (bot.targetDigBlock) {
        bot.chat(`already digging ${bot.targetDigBlock.name}`)
    } else {
        target = bot.blockAt(bot.entity.position.offset(0, -1, 0))
        if (target && bot.canDigBlock(target)) {
            bot.chat(`starting to dig ${target.name}`)
            bot.dig(target, onDiggingCompleted)
        } else {
            bot.chat('cannot dig')
        }
    }

    function onDiggingCompleted(err) {
        if (err) {
            console.log(err.stack)
            return
        }
        bot.chat(`finished digging ${target.name}`)
    }
}

function build() {
    const referenceBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    const jumpY = Math.floor(bot.entity.position.y) + 1.0
    bot.setControlState('jump', true)
    bot.on('move', placeIfHighEnough)

    let tryCount = 0

    function placeIfHighEnough() {
        if (bot.entity.position.y > jumpY) {
            bot.placeBlock(referenceBlock, vec3(0, 1, 0), (err) => {
                if (err) {
                    tryCount++
                    if (tryCount > 10) {
                        bot.chat(err.message)
                        bot.setControlState('jump', false)
                        bot.removeListener('move', placeIfHighEnough)
                        return
                    }
                    return
                }
                bot.setControlState('jump', false)
                bot.removeListener('move', placeIfHighEnough)
                bot.chat('Placing a block was successful')
            })
        }
    }
}

function equipDirt() {
    const mcData = require('minecraft-data')(bot.version)
    let itemsByName
    if (bot.supportFeature('itemsAreNotBlocks')) {
        itemsByName = 'itemsByName'
    } else if (bot.supportFeature('itemsAreAlsoBlocks')) {
        itemsByName = 'blocksByName'
    }
    bot.equip(mcData[itemsByName].dirt.id, 'hand', (err) => {
        if (err) {
            bot.chat(`unable to equip dirt: ${err.message}`)
        } else {
            bot.chat('equipped dirt')
        }
    })
}

function itemToString(item) {
    if (item) {
        return `${item.name} x ${item.count}`
    } else {
        return '(nothing)'
    }
}