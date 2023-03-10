// const { KiviPlugin, http, segment } = require('@kivibot/core')
const { PupPlugin, segment, http } = require('@pupbot/core')

const apiRoot = "https://api.lolicon.app/setu/v2"

// const assert = require('assert');
const { version } = require('./package.json')
    // const plugin = new KiviPlugin("setu", version)
const plugin = new PupPlugin("setu", version)
const supportSize = ["original", "regular", "small", "thumb", "mini"]

const config = {
    "r18": false,
    // "ignore-groups": [],
    "size": "regular",
    "interval": 5000,
    "enable-g": [],
    "enable-f": [],
    "commands": {
        "setu": [
            "/setu",
            "/涩图",
            "来张涩图",
        ],
        "ten-setus": [
            "十张涩图",
            "/setu-10",
            "/setu 10"
        ]
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

function isAdmin(event, mainOnly = false) {
    if (mainOnly) {
        return plugin.admins[0] === event.sender.user_id;
    } else {
        return plugin.admins.includes(event.sender.user_id);
    }
}

function sleep(ms) {
    const start = new Date().getTime()
    while (true) {
        if (new Date().getTime() - start > ms) {
            return
        }
    }
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
        const msg = `〓 糟糕！${plugin.name}运行"${funcname}"发生错误, 请您坐和放宽, 下面是详细错误信息(好东西就要莱纳~) 〓\n${error.stack}\n(如有需要请发送邮件至开发者 public.zhuhansan666@outlook.com 备注 ${plugin.name}:bug)`
        event.reply(msg)
    }
}

async function setu(event, params, plugin, number) {
    if (new Date().getTime() - startTime < config.interval) {
        event.reply(`〓 ${plugin.name}提示 〓\n操作太快了, 年轻人要节制哦~`)
        return
    }
    gid = event.group_id
    uid = event.sender.user_id
    if (gid == undefined && uid != undefined && uid != 0) {
        if (!config['enable-f'].includes(uid) && uid != plugin.mainAdmin) {
            event.reply(`〓 ${plugin.name}提示 〓\n${plugin.name}未在当私聊启用`)
            return
        }
    } else {
        if (!config['enable-g'].includes(gid)) {
            event.reply(`〓 ${plugin.name}提示 〓\n${plugin.name}未在当前群启用`)
            return
        }
    }
    startTime = new Date().getTime()
    event.reply(`〓 ${plugin.name}提示 〓\n正在获取... (共${number}张)`)
    const keywords = params
    size = config.size
    imgUrls = []
    if (!supportSize.includes(size)) {
        size = defaultConfig.size
        event.reply(`〓 ${plugin.name}警告 〓
size "${config.size}" dose not support, used the default size: "${defaultConfig.size}"`)
    }
    try {
        const { data } = await http.get(apiRoot, {
            params: {
                "r18": config.r18 !== true && config.r18 !== false ? parseInt(config.r18) : config.r18 ? 1 : 0,
                "tag": keywords,
                "num": number,
                "size": size
            }
        })
        dataInfo = data.data
        for (item of dataInfo) {
            for (let key of Object.keys(item["urls"])) {
                imgUrls.push(item["urls"][key])
            }
        }
    } catch (error) {
        event.reply(`〓 糟糕！${plugin.name}请求失败, 请您坐和放宽, 下面是详细错误信息(好东西就要莱纳~) 〓\n${error.stack}\n(如有需要请发送邮件至开发者 public.zhuhansan666@outlook.com 备注 ${plugin.name}:bug)`)
        plugin.throwPluginError(error.stack)
    }
    for (imgUrl of imgUrls) {
        event.reply(segment.image(imgUrl))
        sleep(300)
    }
    const spend = (new Date().getTime() - startTime)
    event.reply(`〓 ${plugin.name}提示 〓\n获取完成, 共${number}张, 耗时${spend / 1000}秒, 每张耗时${spend / number}毫秒\n*发送内容有较大延时, 请耐心等待`)
}

function enable(event, params, plugin, args) {
    if (event.message_type == "group") {
        enableGroup(event, params, plugin, args)
    } else {
        controlFriend(event, "enable", plugin, args)
    }
}

function enableGroup(event, params, plugin, args) {
    if (isAdmin(event, false)) {
        gid = event.group_id
        if (gid != undefined && gid != 0) {
            config['enable-g'].push(gid)
            event.reply(`〓 ${plugin.name}提示 〓\n当前群启用成功`)
            plugin.saveConfig(config)
        }
    } else {
        event.reply(`〓 ${plugin.name}提示 〓\nPermission Error: 非管理员`)
    }
}


function controlFriend(event, params, plugin, args) {
    if (!isAdmin(event, false)) {
        event.reply(`〓 ${plugin.name}提示 〓\nPermission Error: 非管理员`)
        return
    }
    uid = event.sender.user_id
    if (params == "enable") {
        if (uid != undefined && uid != 0) {
            config['enable-f'].push(uid)
            event.reply(`〓 ${plugin.name}提示 〓\nqq ${uid} 启用成功`)
            plugin.saveConfig(config)
        }
    } else {
        if (params == "disable") {
            if (uid != undefined && uid != 0) {
                if (config["enable-f"].length > 0) {
                    for (i = 0; i < config["enable-f"].length; i++) {
                        if (config["enable-f"][i] == uid) {
                            config["enable-g"].splice(i, 1)
                        }
                    }
                    event.reply(`〓 ${plugin.name}提示 〓\nqq ${uid} 移除启用成功`)
                    plugin.saveConfig(config)
                }
            }
        } else {
            if (params[0] != undefined) {
                secondCmd = params[0]
                if (secondCmd == "add") {
                    if (uid != undefined && uid != 0) {
                        config['enable-f'].push(uid)
                        event.reply(`〓 ${plugin.name}提示 〓\nqq ${uid} 启用成功`)
                        plugin.saveConfig(config)
                    }
                } else {
                    if (secondCmd == "rm") {
                        if (uid != undefined && uid != 0) {
                            if (config["enable-f"].length > 0) {
                                for (i = 0; i < config["enable-f"].length; i++) {
                                    if (config["enable-f"][i] == uid) {
                                        config["enable-g"].splice(i, 1)
                                    }
                                }
                                event.reply(`〓 ${plugin.name}提示 〓\nqq ${uid} 移除启用成功`)
                                plugin.saveConfig(config)
                            }
                        }
                    } else {
                        event.reply(`〓 ${plugin.name}错误/帮助 〓\n未知的command"${secondCmd}"\n#setu add <qq> -> 使用qq号启用私聊
#setu rm <qq> -> 使用qq号移除启用私聊`)
                    }
                }
            } else {
                event.reply(`〓 ${plugin.name}错误/帮助 〓\n未知的command"[空字符]"\n#setu add <qq> -> 使用qq号启用私聊
#setu rm <qq> -> 使用qq号移除启用私聊`)
            }
        }
    }
}

function disable(event, params, plugin, args) {
    if (event.message_type == "group") {
        disableGroup(event, params, plugin, args)
    } else {
        controlFriend(event, "disable", plugin, args)
    }
}

function disableGroup(event, params, plugin, args) {
    if (isAdmin(event, false)) {
        gid = event.group_id
        if (gid != undefined && gid != 0) {
            console.log(config["enable-g"].length)
            if (config["enable-g"].length > 0) {
                for (i = 0; i < config["enable-g"].length; i++) {
                    if (config["enable-g"][i] == gid) {
                        config["enable-g"].splice(i, 1)
                    }
                }
            }
            event.reply(`〓 ${plugin.name}提示 〓\n当前群移除启用成功`)
            plugin.saveConfig(config)
        }
    } else {
        event.reply(`〓 ${plugin.name}提示 〓\nPermission Error: 非管理员`)
    }
}

plugin.onMounted((bot, admin) => {
    reloadConfig()
    plugin.onCmd("setu", (event) => {
        event.reply(`〓 ${plugin.name}提示 〓\n您可以对我说: \n${config.commands.setu}\n#setu-e,#setu-d`)
    })
    plugin.onCmd(config.commands.setu, (event, params) => hooker(event, params, plugin, setu, 1))
    plugin.onCmd(config.commands['ten-setus'], (event, params) => hooker(event, params, plugin, setu, 10))
    plugin.onCmd("#setu-e", (event, params) => hooker(event, params, plugin, enable))
    plugin.onCmd("#setu-d", (event, params) => hooker(event, params, plugin, disable))
    plugin.onCmd("#setu", (event, params) => hooker(event, params, plugin, controlFriend))
})

module.exports = { plugin }