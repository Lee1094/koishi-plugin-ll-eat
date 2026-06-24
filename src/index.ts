import { Context, Schema, h } from 'koishi'

export interface Config {
  pexelsKey: string
  useKeyword: boolean
  useCommand: boolean
  foodsKeyword: string[]
  drinksKeyword: string[]
  commandName: string
}

export const Config: Schema<Config> = Schema.object({
  pexelsKey: Schema.string().role('secret')
    .description('Pexels API Key（https://pexels.com/api 免费注册，200次/小时）').required(),
  useKeyword: Schema.boolean().description('启用关键词触发').default(true),
  useCommand: Schema.boolean().description('启用命令触发').default(true),
  foodsKeyword: Schema.array(Schema.string()).role('table')
    .description('食物关键词').default(['吃什么', '吃啥', '中午吃', '晚上吃', '早饭吃', '推荐个吃的']),
  drinksKeyword: Schema.array(Schema.string()).role('table')
    .description('饮品关键词').default(['喝什么', '喝啥', '推荐个喝的']),
  commandName: Schema.string().description('命令名').default('eat'),
})

export const name = 'll-eat'

/* ────── 吃得起的美食库（中文名 + 英文搜索词） ────── */

const FOODS: { cn: string; en: string }[] = [
  // 盖饭/炒饭
  { cn: '宫保鸡丁盖饭', en: 'Kung Pao chicken' },
  { cn: '鱼香肉丝盖饭', en: 'yuxiang shredded pork' },
  { cn: '红烧肉盖饭', en: 'braised pork belly rice' },
  { cn: '番茄鸡蛋盖饭', en: 'tomato scrambled egg rice' },
  { cn: '麻婆豆腐盖饭', en: 'mapo tofu rice bowl' },
  { cn: '回锅肉盖饭', en: 'twice cooked pork Sichuan' },
  { cn: '糖醋里脊盖饭', en: 'sweet sour pork tenderloin' },
  { cn: '土豆牛肉盖饭', en: 'potato beef rice bowl' },
  { cn: '黄焖鸡米饭', en: 'braised chicken claypot rice' },
  { cn: '鸡蛋炒饭', en: 'egg fried rice Chinese' },
  { cn: '扬州炒饭', en: 'Yangzhou fried rice' },
  { cn: '虾仁炒饭', en: 'shrimp fried rice' },
  { cn: '酱油炒饭', en: 'soy sauce fried rice' },
  { cn: '菠萝炒饭', en: 'pineapple fried rice' },
  { cn: '咖喱炒饭', en: 'curry fried rice' },
  { cn: '腊肉炒饭', en: 'Chinese cured meat fried rice' },
  // 面
  { cn: '兰州拉面', en: 'Lanzhou beef noodle soup' },
  { cn: '红烧牛肉面', en: 'braised beef noodle soup' },
  { cn: '重庆小面', en: 'Chongqing spicy noodles' },
  { cn: '担担面', en: 'dan dan noodles Sichuan' },
  { cn: '炸酱面', en: 'zhajiang noodles Beijing' },
  { cn: '油泼面', en: 'Chinese oil spill noodles' },
  { cn: '热干面', en: 'Wuhan hot dry noodles' },
  { cn: '葱油拌面', en: 'scallion oil noodles' },
  { cn: '酸辣面', en: 'hot sour noodles Chinese' },
  { cn: '鸡丝凉面', en: 'Chinese cold chicken noodles' },
  { cn: '炒面', en: 'chow mein noodles' },
  { cn: '干炒牛河', en: 'beef chow fun rice noodle' },
  { cn: '海鲜炒面', en: 'seafood chow mein' },
  { cn: '番茄鸡蛋面', en: 'tomato egg noodle soup' },
  // 饺子/包子
  { cn: '猪肉大葱水饺', en: 'Chinese pork dumplings' },
  { cn: '韭菜鸡蛋水饺', en: 'Chinese chive dumplings' },
  { cn: '煎饺', en: 'pan fried dumplings Japanese' },
  { cn: '小笼包', en: 'xiaolongbao soup dumplings' },
  { cn: '鲜肉包子', en: 'Chinese steamed pork buns' },
  { cn: '生煎包', en: 'sheng jian bao pan fried bun' },
  { cn: '锅贴', en: 'Chinese potstickers guo tie' },
  { cn: '馄饨', en: 'wonton soup Chinese' },
  { cn: '红油抄手', en: 'Sichuan chili oil wontons' },
  { cn: '肉夹馍', en: 'Chinese roujiamo meat burger' },
  { cn: '煎饼果子', en: 'jianbing Chinese street crepe' },
  // 炒菜
  { cn: '宫保鸡丁', en: 'Kung Pao chicken' },
  { cn: '鱼香肉丝', en: 'Chinese spicy garlic pork' },
  { cn: '地三鲜', en: 'stir fry potato eggplant pepper' },
  { cn: '酸辣土豆丝', en: 'Chinese shredded potato stir fry' },
  { cn: '西红柿炒鸡蛋', en: 'Chinese tomato scrambled egg' },
  { cn: '麻婆豆腐', en: 'mapo tofu Sichuan' },
  { cn: '手撕包菜', en: 'stir fry cabbage Chinese' },
  { cn: '干煸四季豆', en: 'dry fried green beans Chinese' },
  { cn: '家常豆腐', en: 'Chinese home style tofu' },
  { cn: '蒜蓉西兰花', en: 'garlic broccoli stir fry' },
  { cn: '蚝油生菜', en: 'oyster sauce lettuce Chinese' },
  { cn: '木须肉', en: 'moo shu pork Chinese' },
  { cn: '农家小炒肉', en: 'Chinese stir fried pork chili' },
  // 砂锅/煲/粉
  { cn: '煲仔饭', en: 'Chinese claypot rice' },
  { cn: '砂锅米线', en: 'Chinese claypot rice noodles' },
  { cn: '皮蛋瘦肉粥', en: 'century egg pork congee' },
  { cn: '麻辣烫', en: 'Chinese malatang spicy soup' },
  { cn: '冒菜', en: 'Sichuan mao cai spicy' },
  { cn: '酸辣粉', en: 'hot sour glass noodles' },
  { cn: '螺蛳粉', en: 'Luosifen snail rice noodles' },
  { cn: '桂林米粉', en: 'Guilin rice noodles' },
  { cn: '过桥米线', en: 'crossing bridge noodles Yunnan' },
  { cn: '麻辣香锅', en: 'Chinese mala spicy stir fry pot' },
  // 烧烤/炸物
  { cn: '烤羊肉串', en: 'Chinese lamb skewers BBQ' },
  { cn: '烤鸡翅', en: 'grilled chicken wings' },
  { cn: '炸鸡排', en: 'Taiwanese fried chicken cutlet' },
  { cn: '炸鸡腿', en: 'fried chicken drumstick' },
  { cn: '炸薯条', en: 'French fries crispy' },
  { cn: '烤冷面', en: 'Chinese grilled cold noodles' },
  { cn: '臭豆腐', en: 'Chinese stinky tofu' },
  { cn: '铁板鱿鱼', en: 'grilled squid teppanyaki' },
  // 凉菜/小吃
  { cn: '拍黄瓜', en: 'Chinese smashed cucumber salad' },
  { cn: '皮蛋豆腐', en: 'century egg tofu cold dish' },
  { cn: '凉皮', en: 'Chinese liangpi cold noodles' },
  { cn: '夫妻肺片', en: 'Sichuan fuqi feipian beef' },
  { cn: '凉拌木耳', en: 'Chinese wood ear mushroom salad' },
  // 火锅
  { cn: '重庆火锅', en: 'Chongqing Sichuan hotpot' },
  { cn: '串串香', en: 'Chinese chuanchuan skewer hotpot' },
  // 早餐
  { cn: '油条豆浆', en: 'Chinese youtiao soy milk breakfast' },
  { cn: '豆腐脑', en: 'Chinese tofu pudding breakfast' },
  { cn: '包子小米粥', en: 'Chinese baozi millet porridge' },
  { cn: '肠粉', en: 'cheung fun rice noodle roll' },
  { cn: '茶叶蛋', en: 'Chinese tea eggs' },
  // 地方特色
  { cn: '锅包肉', en: 'guo bao rou sweet sour pork' },
  { cn: '东北乱炖', en: 'Dongbei stew Chinese' },
  { cn: '水煮肉片', en: 'Sichuan boiled beef chili' },
  { cn: '剁椒鱼头', en: 'steamed fish head chili Hunan' },
  { cn: '白切鸡', en: 'Cantonese white cut chicken' },
  { cn: '北京烤鸭', en: 'Peking duck sliced' },
  { cn: '大盘鸡', en: 'Xinjiang big plate chicken' },
  { cn: '叉烧饭', en: 'char siu Cantonese BBQ pork rice' },
  // 简餐
  { cn: '三菜一汤快餐', en: 'Chinese cafeteria food meal' },
  { cn: '食堂快餐', en: 'Chinese food court meal' },
  { cn: '两荤一素盒饭', en: 'Chinese lunch box meal' },
  { cn: '称菜自选', en: 'buffet self serve Chinese food' },
]

const DRINKS: { cn: string; en: string }[] = [
  // 奶茶
  { cn: '珍珠奶茶', en: 'bubble tea boba' },
  { cn: '黑糖珍珠奶茶', en: 'brown sugar boba milk tea' },
  { cn: '抹茶奶茶', en: 'matcha milk tea latte' },
  { cn: '杨枝甘露', en: 'mango pomelo sago dessert' },
  { cn: '芋圆奶茶', en: 'taro ball bubble tea' },
  { cn: '烧仙草', en: 'Chinese grass jelly dessert drink' },
  { cn: '冰粉', en: 'Chinese bingfen ice jelly' },
  // 果汁
  { cn: '鲜榨橙汁', en: 'fresh orange juice glass' },
  { cn: '西瓜汁', en: 'fresh watermelon juice drink' },
  { cn: '芒果汁', en: 'fresh mango juice smoothie' },
  { cn: '草莓汁', en: 'strawberry juice fresh' },
  // 咖啡
  { cn: '美式咖啡', en: 'Americano coffee' },
  { cn: '拿铁', en: 'latte coffee art' },
  { cn: '生椰拿铁', en: 'coconut latte coffee' },
  { cn: '卡布奇诺', en: 'cappuccino coffee foam' },
  { cn: '冷萃咖啡', en: 'cold brew coffee glass' },
  // 茶
  { cn: '冰红茶', en: 'iced lemon tea glass' },
  { cn: '茉莉花茶', en: 'jasmine tea cup Chinese' },
  { cn: '乌龙茶', en: 'Oolong tea Chinese' },
  { cn: '蜜桃乌龙茶', en: 'peach oolong tea drink' },
  { cn: '柠檬茶', en: 'iced lemon tea drink' },
  { cn: '冰绿茶', en: 'iced green tea glass' },
  // 酸奶
  { cn: '酸奶', en: 'yogurt drink cup' },
  { cn: '养乐多', en: 'Yakult probiotic drink' },
  // 汽水
  { cn: '冰可乐', en: 'Coca Cola ice glass' },
  { cn: '北冰洋汽水', en: 'orange soda drink bottle' },
  { cn: '王老吉', en: 'Chinese herbal tea drink can' },
  { cn: '酸梅汤', en: 'Chinese sour plum drink' },
  { cn: '椰汁', en: 'coconut water drink can' },
  // 啤酒
  { cn: '青岛啤酒', en: 'Tsingtao beer glass' },
  { cn: '雪花啤酒', en: 'Chinese beer bottle glass' },
  { cn: '江小白', en: 'Chinese baijiu liquor shot' },
  // 其他
  { cn: '气泡水', en: 'sparkling water glass' },
  { cn: '矿泉水', en: 'mineral water bottle' },
]

interface CachedItem {
  cn: string
  imageUrl: string
  author: string
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('ll-eat')

  let foodCache: CachedItem[] = []
  let drinkCache: CachedItem[] = []
  let refreshing = false

  /* ── 从 Pexels 搜索图片 ── */
  async function searchPexels(en: string, cn: string): Promise<CachedItem | null> {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(en)}&per_page=5&orientation=square&size=medium`
      const res = await ctx.http.get<{
        photos?: Array<{
          src: { large: string; medium: string }
          photographer: string
        }>
      }>(url, {
        headers: { Authorization: config.pexelsKey },
        responseType: 'json',
        timeout: 10000,
      })
      const photos = res?.photos
      if (!photos?.length) return null
      const p = pickOne(photos)
      return {
        cn,
        imageUrl: p.src.large || p.src.medium,
        author: p.photographer,
      }
    } catch (e) {
      logger.debug(`Pexels 搜索失败 [${en}]:`, e)
      return null
    }
  }

  /* ── 刷新缓存 ── */
  async function refreshCache() {
    if (refreshing) return
    refreshing = true
    try {
      const foods: CachedItem[] = []
      const fShuffled = [...FOODS].sort(() => Math.random() - 0.5).slice(0, 25)
      for (const f of fShuffled) {
        const item = await searchPexels(f.en, f.cn)
        if (item) foods.push(item)
        if (foods.length >= 20) break
      }
      if (foods.length) foodCache = foods

      const drinks: CachedItem[] = []
      const dShuffled = [...DRINKS].sort(() => Math.random() - 0.5).slice(0, 15)
      for (const d of dShuffled) {
        const item = await searchPexels(d.en, d.cn)
        if (item) drinks.push(item)
        if (drinks.length >= 10) break
      }
      if (drinks.length) drinkCache = drinks

      logger.info(`缓存已刷新：食物 ${foodCache.length} 张，饮品 ${drinkCache.length} 张`)
    } catch (e) {
      logger.warn('刷新缓存失败:', e)
    } finally {
      refreshing = false
    }
  }

  /* ── 发送 ── */
  function formatItem(item: CachedItem, type: 'food' | 'drink'): string {
    const emoji = type === 'food' ? '🍚' : '🥤'
    const verb = type === 'food' ? '吃' : '喝'
    return h.image(item.imageUrl) + `\n${emoji} 建议${verb}${item.cn}`
  }

  async function sendFood(): Promise<string> {
    if (!foodCache.length) await refreshCache()
    if (!foodCache.length) return '🍚 正在准备美食图片，稍后再试~'
    return formatItem(pickOne(foodCache), 'food')
  }

  async function sendDrink(): Promise<string> {
    if (!drinkCache.length) await refreshCache()
    if (!drinkCache.length) return '🥤 正在准备饮品图片，稍后再试~'
    return formatItem(pickOne(drinkCache), 'drink')
  }

  /* ── 启动加载 + 每 3 小时刷新 ── */
  refreshCache()
  setInterval(() => refreshCache(), 3 * 60 * 60 * 1000)

  /* ── 命令 ── */
  if (config.useCommand) {
    const cmd = ctx.command(config.commandName)
      .alias('吃', '喝', '吃啥', '喝啥', '吃什么', '喝什么')

    cmd.subcommand('.food', '今天吃什么').action(async () => sendFood())
    cmd.subcommand('.drink', '今天喝什么').action(async () => sendDrink())
  }

  /* ── 关键词触发 ── */
  if (config.useKeyword) {
    ctx.middleware(async (session, next) => {
      const text = session.content || ''
      if (typeof text !== 'string' || !text.trim()) return next()

      if (config.foodsKeyword.some(kw => text.includes(kw))) {
        await session.send(await sendFood())
        return next()
      }
      if (config.drinksKeyword.some(kw => text.includes(kw))) {
        await session.send(await sendDrink())
        return next()
      }
      return next()
    })
  }

  logger.info(`已启动，美食 ${FOODS.length} 词条，饮品 ${DRINKS.length} 词条`)
}
