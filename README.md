# pupbot-plugin-setu
> setu获取小工具
> [更新日志](changeLog.md)

## 如何安装

### 安装
```bash
npm install pupbot-plugin-setu
```
> 或在qq对机器人发送
```
/p add setu   // 需要较高版本支持
```
等价于
```
/plugin add setu
```


### 启用
> 在qq对机器人发送
```
/p on setu  // 需要较高版本支持
```
等价于
```
/plugin on setu
```

## 如何使用
* 启用当前群聊 -> `#setu-e`
* 移除启用当前群聊 -> `#setu-d`
* 一张图 -> `/setu`
* 一张图 -> `/涩图`
* 一张图 -> `来张涩图`

## `Config.json`配置
```json
{
    "r18": false,  // r18
    "size": "regular",  // 图片大小(详见https://api.lolicon.app/#/setu?id=size)
    "interval": 5000,  // 最小请求间隔(冷却时间)
    "enable-g": [],  // 启用的群(也可使用命令配置)
    "enable-f": [],  // 启用的好友(注意: 主管理员[mainAdmin]无论是否在此列表中均可使用)
    "commands": {  // 命令关键字定义
        "setu": [
            "/setu",
            "/涩图",
            "来张涩图",
        ],
    }
}
```

## 使用api
```
https://api.lolicon.app/setu/v2
```


## TODO
- [x] 暂时不知道做什么
> 有建议可以发邮件 [public.zhuhansan666@outlook.com](mailto:public.zhuhansan666@outlook.com?subject=setu:suggest)


## issue / bug 反馈
您可以直接在 [我的 Github](https://github.com/zhuhansan666/kivibot-plugin-setu) 提出issue
> 但是我不常看 Github , 推荐发送邮件 [public.zhuhansan666@outlook.com](mailto:public.zhuhansan666@outlook.com?subject=setu:suggest)
