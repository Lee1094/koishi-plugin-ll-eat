import { Context, Schema, h } from 'koishi'

export interface Config {
  unsplashKey: string
  useKeyword: boolean
  useCommand: boolean
  foodsKeyword: string[]
  drinksKeyword: string[]
  commandName: string
}

export const Config: Schema<Config> = Schema.object({
  unsplashKey: Schema.string().role('secret')
    .description('Unsplash Access Key（https://unsplash.com/developers 免费注册）').required(),
  useKeyword: Schema.boolean().description('启用关键词触发（如"吃什么""喝什么"）').default(true),
  useCommand: Schema.boolean().description('启用命令触发').default(true),
  foodsKeyword: Schema.array(Schema.string()).role('table')
    .description('触发食物的关键词').default(['吃什么', '吃啥', '中午吃', '晚上吃', '早饭吃', '推荐个吃的']),
  drinksKeyword: Schema.array(Schema.string()).role('table')
    .description('触发饮品的关键词').default(['喝什么', '喝啥', '推荐个喝的']),
  commandName: Schema.string().description('命令名').default('eat'),
})

export const name = 'll-eat'

/* ────── 吃得起的美食库 ────── */

const FOOD_QUERIES = [
  // 盖饭/炒饭 — 用英文搜 Unsplash 更准
  'Kung Pao chicken rice', 'mapo tofu rice', 'braised pork rice', 'tomato egg rice',
  'twice cooked pork', 'egg fried rice', 'Yangzhou fried rice', 'shrimp fried rice',
  'curry fried rice', 'pineapple fried rice', 'soy sauce fried rice',
  // 面
  'Lanzhou beef noodles', 'braised beef noodle', 'Chongqing noodles', 'dan dan noodles',
  'zhajiang noodles', 'hot dry noodles Wuhan', 'lo mein', 'chow mein',
  'beef chow fun', 'seafood noodle soup', 'wonton noodle soup',
  // 饺子包子
  'Chinese dumplings', 'steamed pork buns', 'xiaolongbao', 'pan fried dumplings',
  'sheng jian bao', 'wonton soup', 'Chinese meat pie roujiamo',
  // 炒菜
  'kung pao chicken', 'mapo tofu', 'sweet sour pork', 'stir fry green beans',
  'scrambled egg tomato China', 'shredded potato stir fry', 'beef broccoli stir fry',
  'home style tofu', 'di san xian potato eggplant pepper', 'garlic bok choy',
  // 火锅/麻辣烫
  'Chinese hotpot', 'Sichuan hotpot', 'mala tang', 'chuan chuan hotpot',
  // 快餐
  'crossing bridge noodles', 'Guilin rice noodles', 'Luosifen snail noodles',
  'sour spicy noodles', 'Lanzhou beef noodle soup', 'Malatang spicy',
  // 烧烤小吃
  'Chinese BBQ skewers lamb', 'Chinese fried chicken', 'Chinese street food',
  'stinky tofu', 'jianbing Chinese crepe', 'Chinese cold noodles',
  // 地方菜
  'guo bao rou', 'Dongbei stew', 'Chinese steamed fish head chili',
  'Sichuan boiled beef', 'Cantonese white cut chicken', 'Peking duck wrap',
  'Xinjiang big plate chicken', 'char siu BBQ pork rice',
  // 粥
  'congee century egg', 'Chinese rice porridge', 'chicken mushroom congee',
  // 早餐
  'soy milk youtiao', 'tofu pudding China', 'rice dumpling zongzi',
  'rice noodle roll cheung fun', 'Chinese breakfast pancake', 'tea egg China',
]

const DRINK_QUERIES = [
  // 奶茶
  'bubble tea', 'pearl milk tea', 'brown sugar milk tea', 'matcha latte',
  'mango pomelo sago', 'taro bubble tea',
  // 果汁
  'fresh watermelon juice', 'fresh orange juice', 'mango smoothie',
  'strawberry juice drink', 'fresh juice China',
  // 咖啡
  'latte art', 'cappuccino coffee', 'cold brew coffee', 'coconut latte',
  // 茶
  'Chinese tea', 'jasmine tea', 'lemon iced tea', 'Oolong tea',
  'chrysanthemum tea', 'ice tea glass',
  // 酸奶
  'yogurt drink', 'Chinese yogurt',
  // 汽水
  'Coca Cola glass', 'ice cold soda', 'Beijing Arctic Ocean soda',
  'Chinese herbal tea Wanglaoji',
  // 啤酒
  'Tsingtao beer', 'Chinese beer glass', 'craft beer bar',
]

interface CachedItem {
  name: string
  imageUrl: string
  author: string
  authorUrl: string
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('ll-eat')

  let foodCache: CachedItem[] = []
  let drinkCache: CachedItem[] = []
  let refreshing = false

  /* ── 从 Unsplash 搜索图片 ── */
  async function searchUnsplash(query: string): Promise<CachedItem | null> {
    try {
      const res = await ctx.http.get<{
        results?: Array<{
          urls: { regular: string; small: string }
          alt_description: string
          user: { name: string; links: { html: string } }
          links: { download_location: string }
        }>
      }>(
        'https://api.unsplash.com/search/photos',
        {
          params: { query, per_page: 5, orientation: 'squarish' },
          headers: { Authorization: `Client-ID ${config.unsplashKey}` },
          responseType: 'json',
          timeout: 10000,
        },
      )
      const results = res?.results
      if (!results?.length) return null
      const img = pickOne(results)
      // 触发 Unsplash 下载计数（合规要求）
      try {
        ctx.http.get(img.links.download_location, {
          headers: { Authorization: `Client-ID ${config.unsplashKey}` },
          timeout: 5000,
        })
      } catch { /* 忽略 */ }
      return {
        name: img.alt_description || query,
        imageUrl: img.urls.regular,
        author: img.user.name,
        authorUrl: img.user.links.html,
      }
    } catch (e) {
      logger.debug(`Unsplash 搜索失败 [${query}]:`, e)
      return null
    }
  }

  /* ── 刷新缓存 ── */
  async function refreshCache() {
    if (refreshing) return
    refreshing = true
    try {
      const foods: CachedItem[] = []
      // 随机选 20 个食物词去搜
      const shuffled = [...FOOD_QUERIES].sort(() => Math.random() - 0.5).slice(0, 20)
      for (const q of shuffled) {
        const item = await searchUnsplash(q)
        if (item) foods.push(item)
        if (foods.length >= 15) break
      }
      if (foods.length) foodCache = foods

      const drinks: CachedItem[] = []
      const dShuffled = [...DRINK_QUERIES].sort(() => Math.random() - 0.5).slice(0, 12)
      for (const q of dShuffled) {
        const item = await searchUnsplash(q)
        if (item) drinks.push(item)
        if (drinks.length >= 8) break
      }
      if (drinks.length) drinkCache = drinks

      logger.info(`缓存已刷新：食物 ${foodCache.length} 图片，饮品 ${drinkCache.length} 图片`)
    } catch (e) {
      logger.warn('刷新缓存失败:', e)
    } finally {
      refreshing = false
    }
  }

  /* ── 发送图片 ── */
  function formatItem(item: CachedItem): string {
    return h.image(item.imageUrl) +
      `\n🍚 ${item.name}\n📷 Unsplash @${item.author}`
  }

  async function sendFood(): Promise<string> {
    if (!foodCache.length) await refreshCache()
    if (!foodCache.length) return '🍚 暂时没有美食推荐，请稍后再试~'
    const item = pickOne(foodCache)
    return formatItem(item)
  }

  async function sendDrink(): Promise<string> {
    if (!drinkCache.length) await refreshCache()
    if (!drinkCache.length) return '🥤 暂时没有饮品推荐，请稍后再试~'
    const item = pickOne(drinkCache)
    return formatItem(item)
  }

  /* ── 启动时加载 + 每 2 小时刷新 ── */
  refreshCache()
  setInterval(() => refreshCache(), 2 * 60 * 60 * 1000)

  /* ── 命令模式 ── */
  if (config.useCommand) {
    const cmd = ctx.command(config.commandName)
      .alias('吃', '喝', '吃啥', '喝啥', '吃什么', '喝什么')

    cmd.subcommand('.food', '今天吃什么 — Unsplash 美食图片')
      .action(async () => sendFood())

    cmd.subcommand('.drink', '今天喝什么 — Unsplash 饮品图片')
      .action(async () => sendDrink())
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

  logger.info(`已启动，美食 ${FOOD_QUERIES.length} 词库，饮品 ${DRINK_QUERIES.length} 词库`)
}
