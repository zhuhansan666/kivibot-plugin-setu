const { KiviPlugin, http, segment } = require('@kivibot/core')

const apiRoot = "https://api.lolicon.app/setu/v2"

const assert = require('assert');
const { version } = require('./package.json')
const plugin = new KiviPlugin("setu", version)
const supportSize = ["original", "regular", "small", "thumb", "mini"]

const config = {
    "r18": false,
    // "ignore-groups": [],
    "size": "regular",
    "interval": 5000,
    "commands": {
        "setu": [
            "/setu",
            "/涩图",
            "来张涩图",
        ],
        // "ten-setus": [
        //     "十张涩图"
        // ]
    }
}
const defaultConfig = JSON.parse(JSON.stringify(config))

var startTime = -1

async function reloadConfig() {
    plugin.saveConfig(Object.assign(config, plugin.loadConfig()))
    for (let key of Object.keys(defaultConfig["commands"])) {
        if (config["commands"][key] == undefined) {
            config["commands"][key] = defaultConfig["commands"][key]
        }
    }
    plugin.saveConfig(config)
}

async function hooker(event, params, plugin, func, args) {
    /**
     * 本函数用于hook错误, 在发生错误时发送错误信息到qq
     */
    try {
        func(event, params, plugin, args)
    } catch (error) {
        try {
            var funcname = func.name
        } catch (err) {
            var funcname = undefined
        }
        const msg = `〓 糟糕！setu运行"${funcname}"发生错误, 请您坐和放宽, 下面是详细错误信息(好东西就要莱纳~) 〓\n${error.stack}\n(如有需要请发送邮件至开发者 public.zhuhansan666@outlook.com 备注 setu:bug)`
        event.reply(msg)
    }
}

async function setu(event, params, plugin, number) {
    if (new Date().getTime() - startTime < config.interval) {
        event.reply(`〓 setu提示 〓\n操作太快了, 年轻人要节制哦~`)
        return
    }
    startTime = new Date().getTime()
    event.reply(`〓 setu提示 〓\n正在获取... (共${number}张)`)
    const keywords = params
    size = config.size
    imgUrls = new Array(0)
    if (!supportSize.includes(size)) {
        size = defaultConfig.size
        event.reply(`〓 setu警告 〓
size "${config.size}" dose not support, used the default size: "${defaultConfig.size}"`)
    }
    try {
        const { data } = await http.get(apiRoot, params = {
            "r18": config.r18 !== true && config.r18 !== false ? parseInt(config.r18) : config.r18 ? 1 : 0,
            "tag": keywords,
            "num": number,
            "size": [size]
        })
        dataInfo = data.data
        for (item of dataInfo) {
            for (let key of Object.keys(item["urls"])) {
                imgUrls.push(item["urls"][key])
            }
        }
    } catch (error) {
        event.reply(`〓 糟糕！setu请求失败, 请您坐和放宽, 下面是详细错误信息(好东西就要莱纳~) 〓\n${error.stack}\n(如有需要请发送邮件至开发者 public.zhuhansan666@outlook.com 备注 setu:bug)`)
        plugin.throwPluginError(error.stack)
    }
    for (imgUrl of imgUrls) {
        event.reply(segment.image(imgUrl))
    }
    const spend = (new Date().getTime() - startTime)
    event.reply(`〓 setu提示 〓\n获取完成, 共${number}张, 耗时${spend / 1000}秒, 每张耗时${spend / number}毫秒`)
}

plugin.onMounted((bot, admin) => {
    reloadConfig()
    plugin.onCmd(plugin.name, (event) => {
        event.reply(`〓 setu提示 〓\n您可以对我说: \n${config.commands.setu}`)
    })
    plugin.onCmd(config.commands.setu, (event, params, plugin) => hooker(event, params, plugin, setu, 1))
        // plugin.onCmd(config.commands['ten-setus'], (event, params, plugin) => hooker(event, params, plugin, setu, 10))
})

module.exports = { plugin }