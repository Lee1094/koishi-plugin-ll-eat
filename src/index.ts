import { Context, Schema, h } from 'koishi'

export interface Config {
  unsplashKey: string
  timeFilter: boolean
  useKeyword: boolean
  useCommand: boolean
  foodsKeyword: string[]
  drinksKeyword: string[]
  commandName: string
}

export const Config: Schema<Config> = Schema.object({
  unsplashKey: Schema.string().role('secret')
    .description('Unsplash Access Key（饮品用，免费 50次/小时）').required(),
  timeFilter: Schema.boolean()
    .description('按时间段过滤（早上不推火锅，晚上不推早餐）').default(true),
  useKeyword: Schema.boolean().description('启用关键词触发').default(true),
  useCommand: Schema.boolean().description('启用命令触发').default(true),
  foodsKeyword: Schema.array(Schema.string()).role('table')
    .description('食物关键词').default(['吃什么', '吃啥', '中午吃', '晚上吃', '早饭吃', '推荐吃的']),
  drinksKeyword: Schema.array(Schema.string()).role('table')
    .description('饮品关键词').default(['喝什么', '喝啥', '推荐喝的']),
  commandName: Schema.string().description('命令名').default('eat'),
})

export const name = 'll-eat'

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'night'

interface Dish {
  name: string
  meals: Meal[]
  search: string   // 下厨房搜索词 / Unsplash 搜索词
}

/* ────── 食物：下厨房搜图 ────── */
const FOODS: Dish[] = [
  { name: '油条豆浆', meals: ['breakfast'], search: '油条' },
  { name: '豆腐脑', meals: ['breakfast'], search: '豆腐脑' },
  { name: '煎饼果子', meals: ['breakfast', 'lunch'], search: '煎饼果子' },
  { name: '鸡蛋灌饼', meals: ['breakfast', 'lunch'], search: '鸡蛋灌饼' },
  { name: '包子', meals: ['breakfast', 'lunch', 'dinner'], search: '包子' },
  { name: '肠粉', meals: ['breakfast', 'lunch'], search: '肠粉' },
  { name: '茶叶蛋', meals: ['breakfast', 'lunch'], search: '茶叶蛋' },
  { name: '烧麦', meals: ['breakfast', 'lunch'], search: '烧麦' },
  { name: '肉粽', meals: ['breakfast'], search: '肉粽' },
  { name: '小笼包', meals: ['breakfast', 'lunch', 'dinner'], search: '小笼包' },
  { name: '蒸饺', meals: ['breakfast', 'lunch', 'dinner'], search: '蒸饺' },
  { name: '黄焖鸡米饭', meals: ['lunch', 'dinner'], search: '黄焖鸡' },
  { name: '宫保鸡丁盖饭', meals: ['lunch', 'dinner'], search: '宫保鸡丁' },
  { name: '鱼香肉丝盖饭', meals: ['lunch', 'dinner'], search: '鱼香肉丝' },
  { name: '红烧肉盖饭', meals: ['lunch', 'dinner'], search: '红烧肉' },
  { name: '番茄鸡蛋盖饭', meals: ['lunch', 'dinner'], search: '番茄炒蛋' },
  { name: '土豆牛肉盖饭', meals: ['lunch', 'dinner'], search: '土豆烧牛肉' },
  { name: '回锅肉盖饭', meals: ['lunch', 'dinner'], search: '回锅肉' },
  { name: '糖醋里脊盖饭', meals: ['lunch', 'dinner'], search: '糖醋里脊' },
  { name: '麻婆豆腐盖饭', meals: ['lunch', 'dinner'], search: '麻婆豆腐' },
  { name: '卤肉饭', meals: ['lunch', 'dinner'], search: '卤肉饭' },
  { name: '咖喱鸡肉饭', meals: ['lunch', 'dinner'], search: '咖喱鸡' },
  { name: '黑椒牛柳盖饭', meals: ['lunch', 'dinner'], search: '黑椒牛柳' },
  { name: '叉烧饭', meals: ['lunch', 'dinner'], search: '叉烧' },
  { name: '蛋炒饭', meals: ['lunch', 'dinner', 'night'], search: '蛋炒饭' },
  { name: '扬州炒饭', meals: ['lunch', 'dinner', 'night'], search: '扬州炒饭' },
  { name: '虾仁炒饭', meals: ['lunch', 'dinner'], search: '虾仁炒饭' },
  { name: '酱油炒饭', meals: ['lunch', 'dinner', 'night'], search: '酱油炒饭' },
  { name: '咖喱炒饭', meals: ['lunch', 'dinner'], search: '咖喱炒饭' },
  { name: '兰州拉面', meals: ['lunch', 'dinner', 'night'], search: '兰州拉面' },
  { name: '红烧牛肉面', meals: ['lunch', 'dinner', 'night'], search: '红烧牛肉面' },
  { name: '重庆小面', meals: ['lunch', 'dinner', 'night'], search: '重庆小面' },
  { name: '担担面', meals: ['lunch', 'dinner'], search: '担担面' },
  { name: '炸酱面', meals: ['lunch', 'dinner'], search: '炸酱面' },
  { name: '油泼面', meals: ['lunch', 'dinner'], search: '油泼面' },
  { name: '热干面', meals: ['lunch', 'dinner'], search: '热干面' },
  { name: '葱油拌面', meals: ['lunch', 'dinner'], search: '葱油拌面' },
  { name: '番茄鸡蛋面', meals: ['lunch', 'dinner'], search: '番茄鸡蛋面' },
  { name: '炒面', meals: ['lunch', 'dinner', 'night'], search: '炒面' },
  { name: '干炒牛河', meals: ['lunch', 'dinner', 'night'], search: '干炒牛河' },
  { name: '螺蛳粉', meals: ['lunch', 'dinner', 'night'], search: '螺蛳粉' },
  { name: '酸辣粉', meals: ['lunch', 'dinner', 'night'], search: '酸辣粉' },
  { name: '桂林米粉', meals: ['lunch', 'dinner'], search: '桂林米粉' },
  { name: '过桥米线', meals: ['lunch', 'dinner'], search: '过桥米线' },
  { name: '新疆炒米粉', meals: ['lunch', 'dinner', 'night'], search: '新疆炒米粉' },
  { name: '花甲粉', meals: ['lunch', 'dinner', 'night'], search: '花甲粉' },
  { name: '水饺', meals: ['lunch', 'dinner', 'night'], search: '饺子' },
  { name: '煎饺', meals: ['lunch', 'dinner', 'night'], search: '煎饺' },
  { name: '生煎包', meals: ['breakfast', 'lunch', 'dinner'], search: '生煎包' },
  { name: '馄饨', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '馄饨' },
  { name: '红油抄手', meals: ['lunch', 'dinner', 'night'], search: '红油抄手' },
  { name: '西红柿炒鸡蛋', meals: ['lunch', 'dinner'], search: '西红柿炒鸡蛋' },
  { name: '酸辣土豆丝', meals: ['lunch', 'dinner'], search: '酸辣土豆丝' },
  { name: '鱼香肉丝', meals: ['lunch', 'dinner'], search: '鱼香肉丝' },
  { name: '地三鲜', meals: ['lunch', 'dinner'], search: '地三鲜' },
  { name: '手撕包菜', meals: ['lunch', 'dinner'], search: '手撕包菜' },
  { name: '干煸四季豆', meals: ['lunch', 'dinner'], search: '干煸四季豆' },
  { name: '家常豆腐', meals: ['lunch', 'dinner'], search: '家常豆腐' },
  { name: '蒜蓉西兰花', meals: ['lunch', 'dinner'], search: '蒜蓉西兰花' },
  { name: '蚝油生菜', meals: ['lunch', 'dinner'], search: '蚝油生菜' },
  { name: '水煮肉片', meals: ['lunch', 'dinner'], search: '水煮肉片' },
  { name: '锅包肉', meals: ['lunch', 'dinner'], search: '锅包肉' },
  { name: '农家小炒肉', meals: ['lunch', 'dinner'], search: '小炒肉' },
  { name: '干锅花菜', meals: ['lunch', 'dinner'], search: '干锅花菜' },
  { name: '煲仔饭', meals: ['lunch', 'dinner'], search: '煲仔饭' },
  { name: '砂锅米线', meals: ['lunch', 'dinner'], search: '砂锅米线' },
  { name: '皮蛋瘦肉粥', meals: ['breakfast', 'dinner', 'night'], search: '皮蛋瘦肉粥' },
  { name: '八宝粥', meals: ['breakfast', 'night'], search: '八宝粥' },
  { name: '麻辣烫', meals: ['lunch', 'dinner', 'night'], search: '麻辣烫' },
  { name: '冒菜', meals: ['lunch', 'dinner', 'night'], search: '冒菜' },
  { name: '麻辣香锅', meals: ['lunch', 'dinner', 'night'], search: '麻辣香锅' },
  { name: '关东煮', meals: ['lunch', 'dinner', 'night'], search: '关东煮' },
  { name: '鸡腿堡', meals: ['lunch', 'dinner', 'night'], search: '鸡腿汉堡' },
  { name: '炸鸡排', meals: ['lunch', 'dinner', 'night'], search: '炸鸡排' },
  { name: '韩式炸鸡', meals: ['lunch', 'dinner', 'night'], search: '韩式炸鸡' },
  { name: '鸡米花', meals: ['lunch', 'dinner', 'night'], search: '鸡米花' },
  { name: '炸薯条', meals: ['lunch', 'dinner', 'night'], search: '炸薯条' },
  { name: '烤羊肉串', meals: ['dinner', 'night'], search: '烤羊肉串' },
  { name: '烤鸡翅', meals: ['dinner', 'night'], search: '烤鸡翅' },
  { name: '烤鱿鱼', meals: ['dinner', 'night'], search: '烤鱿鱼' },
  { name: '烤面筋', meals: ['dinner', 'night'], search: '烤面筋' },
  { name: '烤茄子', meals: ['dinner', 'night'], search: '烤茄子' },
  { name: '铁板鱿鱼', meals: ['dinner', 'night'], search: '铁板鱿鱼' },
  { name: '烤冷面', meals: ['dinner', 'night'], search: '烤冷面' },
  { name: '肉夹馍', meals: ['lunch', 'dinner', 'night'], search: '肉夹馍' },
  { name: '凉皮', meals: ['lunch', 'dinner'], search: '凉皮' },
  { name: '臭豆腐', meals: ['dinner', 'night'], search: '臭豆腐' },
  { name: '手抓饼', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '手抓饼' },
  { name: '狼牙土豆', meals: ['dinner', 'night'], search: '狼牙土豆' },
  { name: '重庆火锅', meals: ['dinner', 'night'], search: '火锅' },
  { name: '串串香', meals: ['dinner', 'night'], search: '串串香' },
  { name: '北京烤鸭', meals: ['lunch', 'dinner'], search: '北京烤鸭' },
  { name: '白切鸡', meals: ['lunch', 'dinner'], search: '白切鸡' },
  { name: '新疆大盘鸡', meals: ['lunch', 'dinner'], search: '大盘鸡' },
  { name: '猪肉白菜炖粉条', meals: ['lunch', 'dinner'], search: '猪肉炖粉条' },
  { name: '两荤一素快餐', meals: ['lunch', 'dinner'], search: '盒饭快餐' },
  { name: '食堂自选菜', meals: ['lunch', 'dinner'], search: '食堂菜' },
]

/* ────── 饮品：Unsplash 搜图（下厨房没有饮料图） ────── */
const DRINKS: Dish[] = [
  { name: '珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: 'bubble tea' },
  { name: '黑糖珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: 'brown sugar boba' },
  { name: '芋圆奶茶', meals: ['lunch', 'dinner', 'night'], search: 'taro bubble tea' },
  { name: '抹茶奶茶', meals: ['lunch', 'dinner'], search: 'matcha latte' },
  { name: '杨枝甘露', meals: ['lunch', 'dinner', 'night'], search: 'mango sago dessert' },
  { name: '烧仙草', meals: ['dinner', 'night'], search: 'grass jelly dessert' },
  { name: '冰粉', meals: ['dinner', 'night'], search: 'ice jelly dessert' },
  { name: '柠檬水', meals: ['lunch', 'dinner', 'night'], search: 'lemonade drink' },
  { name: '鲜榨橙汁', meals: ['breakfast', 'lunch', 'dinner'], search: 'fresh orange juice' },
  { name: '西瓜汁', meals: ['dinner', 'night'], search: 'watermelon juice' },
  { name: '芒果汁', meals: ['lunch', 'dinner'], search: 'mango juice' },
  { name: '美式咖啡', meals: ['breakfast', 'lunch'], search: 'americano coffee' },
  { name: '拿铁', meals: ['breakfast', 'lunch', 'dinner'], search: 'latte coffee art' },
  { name: '生椰拿铁', meals: ['lunch', 'dinner'], search: 'coconut latte' },
  { name: '冰美式', meals: ['lunch', 'dinner'], search: 'iced americano' },
  { name: '冰红茶', meals: ['lunch', 'dinner', 'night'], search: 'iced tea lemon' },
  { name: '茉莉花茶', meals: ['breakfast', 'lunch', 'dinner'], search: 'jasmine tea chinese' },
  { name: '蜜桃乌龙茶', meals: ['lunch', 'dinner'], search: 'peach tea drink' },
  { name: '酸奶', meals: ['breakfast', 'lunch', 'dinner'], search: 'yogurt cup' },
  { name: '冰可乐', meals: ['lunch', 'dinner', 'night'], search: 'coca cola drink' },
  { name: '北冰洋', meals: ['lunch', 'dinner', 'night'], search: 'orange soda bottle' },
  { name: '青岛啤酒', meals: ['dinner', 'night'], search: 'beer glass pub' },
  { name: '酸梅汤', meals: ['lunch', 'dinner', 'night'], search: 'sour plum drink' },
  { name: '椰汁', meals: ['lunch', 'dinner', 'night'], search: 'coconut water drink' },
  { name: '矿泉水', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: 'mineral water' },
]

interface CachedItem {
  name: string
  imageUrl: string
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function currentMeal(): Meal {
  const h = new Date().getHours()
  if (h >= 5 && h < 10) return 'breakfast'
  if (h >= 10 && h < 14) return 'lunch'
  if (h >= 14 && h < 21) return 'dinner'
  return 'night'
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('ll-eat')

  let foodCache: CachedItem[] = []
  let drinkCache: CachedItem[] = []
  let refreshing = false

  function filterDishes(list: Dish[]): Dish[] {
    if (!config.timeFilter) return list
    const meal = currentMeal()
    const filtered = list.filter(d => d.meals.includes(meal))
    return filtered.length ? filtered : list
  }

  /* ── 从下厨房 HTML 中提取图片 URL ── */
  function extractXcfImages(html: string): string[] {
    const urls: string[] = []
    const re = /https?:\/\/i2\.chuimg\.com\/[a-f0-9]+_\d+w_\d+h\.jpg[^"'\s]*/g
    let m: RegExpExecArray | null
    while ((m = re.exec(html)) !== null) {
      urls.push(m[0])
    }
    return urls
  }

  /* ── 下厨房搜图 ── */
  async function searchXcf(keyword: string): Promise<string | null> {
    try {
      const url = `https://www.xiachufang.com/search/?keyword=${encodeURIComponent(keyword)}`
      const html: string = await ctx.http.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
        responseType: 'text',
        timeout: 15000,
      })
      const imgs = extractXcfImages(html)
      if (imgs.length) return imgs[0]
      // 调试：看看返回了什么
      const preview = html.slice(0, 300).replace(/\n/g, ' ')
      logger.warn(`下厨房 无图 [${keyword}] HTML前300: ${preview}`)
      return null
    } catch (e: any) {
      logger.warn(`下厨房 失败 [${keyword}]: ${e?.message || e}`)
      return null
    }
  }

  /* ── Unsplash 搜图（饮品用） ── */
  async function searchUnsplash(query: string): Promise<string | null> {
    try {
      const res = await ctx.http.get<{
        results?: Array<{ urls: { regular: string }; links: { download_location: string } }>
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
      if (results?.length) {
        const img = results[Math.floor(Math.random() * results.length)]
        try { ctx.http.get(img.links.download_location, { headers: { Authorization: `Client-ID ${config.unsplashKey}` }, timeout: 5000 }) } catch { /* */ }
        return img.urls.regular
      }
    } catch (e) {
      logger.debug(`Unsplash 失败 [${query}]:`, e)
    }
    return null
  }

  /* ── 刷新缓存 ── */
  async function refreshCache() {
    if (refreshing) return
    refreshing = true
    try {
      const meal = currentMeal()
      const mealName = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', night: '夜宵' }[meal]

      // 食物：下厨房
      const foods: CachedItem[] = []
      const fDishes = filterDishes(FOODS)
      const fSeen = new Map<string, string>()
      for (const d of fDishes) {
        if (fSeen.has(d.search)) {
          foods.push({ name: d.name, imageUrl: fSeen.get(d.search)! })
          continue
        }
        const img = await searchXcf(d.search)
        if (img) {
          fSeen.set(d.search, img)
          for (const dd of fDishes.filter(x => x.search === d.search)) {
            foods.push({ name: dd.name, imageUrl: img })
          }
        }
      }
      if (foods.length) foodCache = foods
      logger.info(`[${mealName}] 下厨房 食物 ${foodCache.length} 条`)

      // 饮品：Unsplash
      const drinks: CachedItem[] = []
      const dDishes = filterDishes(DRINKS)
      const dSeen = new Map<string, string>()
      for (const d of dDishes) {
        if (dSeen.has(d.search)) {
          drinks.push({ name: d.name, imageUrl: dSeen.get(d.search)! })
          continue
        }
        const img = await searchUnsplash(d.search)
        if (img) {
          dSeen.set(d.search, img)
          for (const dd of dDishes.filter(x => x.search === d.search)) {
            drinks.push({ name: dd.name, imageUrl: img })
          }
        }
      }
      if (drinks.length) drinkCache = drinks
      logger.info(`[${mealName}] Unsplash 饮品 ${drinkCache.length} 条`)
    } catch (e) {
      logger.warn('刷新失败:', e)
    } finally {
      refreshing = false
    }
  }

  function formatItem(item: CachedItem, type: 'food' | 'drink'): string {
    const emoji = type === 'food' ? '🍚' : '🥤'
    const verb = type === 'food' ? '吃' : '喝'
    return h.image(item.imageUrl) + `\n${emoji} 建议${verb}${item.name}`
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

  refreshCache()
  setInterval(() => refreshCache(), 3 * 60 * 60 * 1000)

  if (config.useCommand) {
    // 吃 → 直接出食物建议
    ctx.command(`${config.commandName}.food`, '今天吃什么')
      .alias('吃', '吃啥', '吃什么')
      .action(async () => sendFood())

    // 喝 → 直接出饮品建议
    ctx.command(`${config.commandName}.drink`, '今天喝什么')
      .alias('喝', '喝啥', '喝什么')
      .action(async () => sendDrink())
  }

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

  logger.info(`已启动：${FOODS.length} 食物(下厨房) ${DRINKS.length} 饮品(Unsplash) 时段${config.timeFilter ? '开' : '关'}`)
}
