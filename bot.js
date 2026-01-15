const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalBlock } = goals
const mcDataLoader = require('minecraft-data')
const config = require('./settings.json')

function startBot () {
  const bot = mineflayer.createBot({
    username: config['bot-account'].username,
    auth: config['bot-account'].type,
    host: config.server.ip,
    port: config.server.port,
    version: config.server.version
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('✅ Bot joined the server')

    const mcData = mcDataLoader(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    /* AUTO AUTH */
    if (config.utils['auto-auth'].enabled) {
      setTimeout(() => {
        bot.chat(`/login ${config.utils['auto-auth'].password}`)
      }, 3000)
    }

    /* CHAT MESSAGES */
    if (config.utils['chat-messages'].enabled) {
      let msgs = config.utils['chat-messages'].messages
      let i = 0

      setInterval(() => {
        if (!bot.player) return
        bot.chat(msgs[i])
        i = (i + 1) % msgs.length
      }, config.utils['chat-messages']['repeat-delay'] * 1000)
    }

    /* POSITION MOVE */
    if (config.position.enabled) {
      bot.pathfinder.setGoal(
        new GoalBlock(
          config.position.x,
          config.position.y,
          config.position.z
        )
      )
    }

    /* ANTI AFK */
    if (config.utils['anti-afk'].enabled) {
      if (config.utils['anti-afk'].sneak) bot.setControlState('sneak', true)
      if (config.utils['anti-afk'].jump) bot.setControlState('jump', true)

      if (config.utils['anti-afk'].rotate) {
        setInterval(() => {
          if (!bot.entity) return
          bot.look(bot.entity.yaw + 0.3, bot.entity.pitch, true)
        }, 200)
      }
    }
  })

  bot.on('chat', (username, message) => {
    if (config.utils['chat-log']) {
      console.log(`<${username}> ${message}`)
    }
  })

  bot.on('end', () => {
    console.log('❌ Bot disconnected, reconnecting...')
    setTimeout(startBot, config.utils['auto-reconnect-delay'])
  })

  bot.on('error', err => {
    console.log('⚠️ Error:', err.message)
  })
}

startBot()
