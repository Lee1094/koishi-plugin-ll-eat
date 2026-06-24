import { Context, Schema, h } from 'koishi'

export interface Config {
  bingKey: string
  timeFilter: boolean
  useKeyword: boolean
  useCommand: boolean
  foodsKeyword: string[]
  drinksKeyword: string[]
  commandName: string
}

export const Config: Schema<Config> = Schema.object({
  bingKey: Schema.string().role('secret')
    .description('Bing Image Search API Key（Azure 免费 1000次/月）').required(),
  timeFilter: Schema.boolean()
    .description('按时间段过滤（早上不推火锅，晚上不推早餐）').default(true),
  useKeyword: Schema.boolean().description('启用关键词触发').default(true),
  useCommand: Schema.boolean().description('启用命令触发').default(true),
  foodsKeyword: Schema.array(Schema.string()).role('table')
    .description('食物关键词').default(['吃什么', '吃啥', '中午吃', '晚上吃', '早饭吃', '推荐个吃的']),
  drinksKeyword: Schema.array(Schema.string()).role('table')
    .description('饮品关键词').default(['喝什么', '喝啥', '推荐个喝的']),
  commandName: Schema.string().description('命令名').default('eat'),
})

export const name = 'll-eat'

/* ────── 美团外卖级菜单：菜名 + 适合时段 + 搜索词 ────── */

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'night'

interface Dish {
  name: string
  meals: Meal[]        // 适合什么时段
  search: string       // Bing 搜索词（中文，保证搜到真图）
}

const FOODS: Dish[] = [
  // ── 早餐（只在早晨/上午推荐） ──
  { name: '油条豆浆', meals: ['breakfast'], search: '油条豆浆早餐' },
  { name: '豆腐脑', meals: ['breakfast'], search: '豆腐脑早餐' },
  { name: '茶叶蛋小米粥', meals: ['breakfast'], search: '小米粥早餐' },
  { name: '鸡蛋灌饼', meals: ['breakfast', 'lunch'], search: '鸡蛋灌饼' },
  { name: '煎饼果子', meals: ['breakfast', 'lunch'], search: '煎饼果子' },
  { name: '糯米饭团', meals: ['breakfast'], search: '糯米饭团早餐' },
  { name: '烧麦', meals: ['breakfast', 'lunch'], search: '烧麦' },
  { name: '肉粽', meals: ['breakfast'], search: '肉粽' },
  { name: '肠粉', meals: ['breakfast', 'lunch'], search: '肠粉' },
  { name: '蒸饺', meals: ['breakfast', 'lunch', 'dinner'], search: '蒸饺' },
  { name: '包子小米粥', meals: ['breakfast'], search: '包子小米粥早餐' },

  // ── 盖饭/拌饭（午晚餐） ──
  { name: '黄焖鸡米饭', meals: ['lunch', 'dinner'], search: '黄焖鸡米饭' },
  { name: '宫保鸡丁盖饭', meals: ['lunch', 'dinner'], search: '宫保鸡丁盖饭' },
  { name: '鱼香肉丝盖饭', meals: ['lunch', 'dinner'], search: '鱼香肉丝盖饭' },
  { name: '红烧肉盖饭', meals: ['lunch', 'dinner'], search: '红烧肉盖饭' },
  { name: '番茄鸡蛋盖饭', meals: ['lunch', 'dinner'], search: '番茄鸡蛋盖饭' },
  { name: '土豆牛肉盖饭', meals: ['lunch', 'dinner'], search: '土豆牛肉盖饭' },
  { name: '回锅肉盖饭', meals: ['lunch', 'dinner'], search: '回锅肉盖饭' },
  { name: '糖醋里脊盖饭', meals: ['lunch', 'dinner'], search: '糖醋里脊盖饭' },
  { name: '麻婆豆腐盖饭', meals: ['lunch', 'dinner'], search: '麻婆豆腐盖饭' },
  { name: '肉末茄子盖饭', meals: ['lunch', 'dinner'], search: '肉末茄子盖饭' },
  { name: '卤肉饭', meals: ['lunch', 'dinner'], search: '卤肉饭' },
  { name: '咖喱鸡肉饭', meals: ['lunch', 'dinner'], search: '咖喱鸡肉饭' },
  { name: '照烧鸡腿饭', meals: ['lunch', 'dinner'], search: '照烧鸡腿饭' },
  { name: '黑椒牛柳盖饭', meals: ['lunch', 'dinner'], search: '黑椒牛柳盖饭' },
  { name: '叉烧饭', meals: ['lunch', 'dinner'], search: '叉烧饭' },

  // ── 炒饭 ──
  { name: '蛋炒饭', meals: ['lunch', 'dinner', 'night'], search: '蛋炒饭' },
  { name: '扬州炒饭', meals: ['lunch', 'dinner', 'night'], search: '扬州炒饭' },
  { name: '虾仁炒饭', meals: ['lunch', 'dinner'], search: '虾仁炒饭' },
  { name: '酱油炒饭', meals: ['lunch', 'dinner', 'night'], search: '酱油炒饭' },
  { name: '咖喱炒饭', meals: ['lunch', 'dinner'], search: '咖喱炒饭' },
  { name: '菠萝炒饭', meals: ['lunch', 'dinner'], search: '菠萝炒饭' },

  // ── 面类 ──
  { name: '兰州拉面', meals: ['lunch', 'dinner', 'night'], search: '兰州拉面' },
  { name: '红烧牛肉面', meals: ['lunch', 'dinner', 'night'], search: '红烧牛肉面' },
  { name: '重庆小面', meals: ['lunch', 'dinner', 'night'], search: '重庆小面' },
  { name: '担担面', meals: ['lunch', 'dinner'], search: '担担面' },
  { name: '炸酱面', meals: ['lunch', 'dinner'], search: '炸酱面' },
  { name: '油泼面', meals: ['lunch', 'dinner'], search: '油泼面' },
  { name: '热干面', meals: ['lunch', 'dinner'], search: '热干面' },
  { name: '葱油拌面', meals: ['lunch', 'dinner'], search: '葱油拌面' },
  { name: '番茄鸡蛋面', meals: ['lunch', 'dinner'], search: '番茄鸡蛋面' },
  { name: '雪菜肉丝面', meals: ['lunch', 'dinner'], search: '雪菜肉丝面' },
  { name: '炒面', meals: ['lunch', 'dinner', 'night'], search: '炒面' },
  { name: '干炒牛河', meals: ['lunch', 'dinner', 'night'], search: '干炒牛河' },

  // ── 粉类 ──
  { name: '螺蛳粉', meals: ['lunch', 'dinner', 'night'], search: '螺蛳粉' },
  { name: '酸辣粉', meals: ['lunch', 'dinner', 'night'], search: '酸辣粉' },
  { name: '桂林米粉', meals: ['lunch', 'dinner'], search: '桂林米粉' },
  { name: '过桥米线', meals: ['lunch', 'dinner'], search: '过桥米线' },
  { name: '新疆炒米粉', meals: ['lunch', 'dinner', 'night'], search: '新疆炒米粉' },
  { name: '花甲粉', meals: ['lunch', 'dinner', 'night'], search: '花甲粉' },

  // ── 饺子/包子 ──
  { name: '猪肉大葱水饺', meals: ['lunch', 'dinner', 'night'], search: '水饺' },
  { name: '韭菜鸡蛋水饺', meals: ['lunch', 'dinner', 'night'], search: '水饺' },
  { name: '煎饺', meals: ['lunch', 'dinner', 'night'], search: '煎饺' },
  { name: '锅贴', meals: ['lunch', 'dinner', 'night'], search: '锅贴' },
  { name: '小笼包', meals: ['breakfast', 'lunch', 'dinner'], search: '小笼包' },
  { name: '鲜肉包子', meals: ['breakfast', 'lunch', 'dinner'], search: '鲜肉包子' },
  { name: '生煎包', meals: ['breakfast', 'lunch', 'dinner'], search: '生煎包' },
  { name: '馄饨', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '馄饨' },
  { name: '红油抄手', meals: ['lunch', 'dinner', 'night'], search: '红油抄手' },

  // ── 炒菜 ──
  { name: '西红柿炒鸡蛋', meals: ['lunch', 'dinner'], search: '西红柿炒鸡蛋' },
  { name: '酸辣土豆丝', meals: ['lunch', 'dinner'], search: '酸辣土豆丝' },
  { name: '宫保鸡丁', meals: ['lunch', 'dinner'], search: '宫保鸡丁' },
  { name: '鱼香肉丝', meals: ['lunch', 'dinner'], search: '鱼香肉丝' },
  { name: '麻婆豆腐', meals: ['lunch', 'dinner'], search: '麻婆豆腐' },
  { name: '地三鲜', meals: ['lunch', 'dinner'], search: '地三鲜' },
  { name: '手撕包菜', meals: ['lunch', 'dinner'], search: '手撕包菜' },
  { name: '干煸四季豆', meals: ['lunch', 'dinner'], search: '干煸四季豆' },
  { name: '家常豆腐', meals: ['lunch', 'dinner'], search: '家常豆腐' },
  { name: '蒜蓉西兰花', meals: ['lunch', 'dinner'], search: '蒜蓉西兰花' },
  { name: '蚝油生菜', meals: ['lunch', 'dinner'], search: '蚝油生菜' },
  { name: '水煮肉片', meals: ['lunch', 'dinner'], search: '水煮肉片' },
  { name: '锅包肉', meals: ['lunch', 'dinner'], search: '锅包肉' },
  { name: '农家小炒肉', meals: ['lunch', 'dinner'], search: '农家小炒肉' },
  { name: '干锅花菜', meals: ['lunch', 'dinner'], search: '干锅花菜' },

  // ── 砂锅/煲/粥 ──
  { name: '煲仔饭', meals: ['lunch', 'dinner'], search: '煲仔饭' },
  { name: '砂锅米线', meals: ['lunch', 'dinner'], search: '砂锅米线' },
  { name: '皮蛋瘦肉粥', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '皮蛋瘦肉粥' },
  { name: '八宝粥', meals: ['breakfast', 'night'], search: '八宝粥' },
  { name: '小米南瓜粥', meals: ['breakfast', 'dinner'], search: '小米南瓜粥' },

  // ── 麻辣烫/冒菜/香锅 ──
  { name: '麻辣烫', meals: ['lunch', 'dinner', 'night'], search: '麻辣烫' },
  { name: '冒菜', meals: ['lunch', 'dinner', 'night'], search: '冒菜' },
  { name: '麻辣香锅', meals: ['lunch', 'dinner', 'night'], search: '麻辣香锅' },
  { name: '关东煮', meals: ['lunch', 'dinner', 'night'], search: '关东煮' },

  // ── 炸鸡/快餐 ──
  { name: '香辣鸡腿堡', meals: ['lunch', 'dinner', 'night'], search: '香辣鸡腿堡' },
  { name: '炸鸡排', meals: ['lunch', 'dinner', 'night'], search: '炸鸡排' },
  { name: '炸鸡腿', meals: ['lunch', 'dinner', 'night'], search: '炸鸡腿' },
  { name: '韩式炸鸡', meals: ['lunch', 'dinner', 'night'], search: '韩式炸鸡' },
  { name: '鸡米花', meals: ['lunch', 'dinner', 'night'], search: '鸡米花' },

  // ── 烧烤/铁板（侧重夜宵） ──
  { name: '羊肉串', meals: ['dinner', 'night'], search: '烤羊肉串' },
  { name: '烤鸡翅', meals: ['dinner', 'night'], search: '烤鸡翅' },
  { name: '烤鱿鱼', meals: ['dinner', 'night'], search: '烤鱿鱼' },
  { name: '烤面筋', meals: ['dinner', 'night'], search: '烤面筋' },
  { name: '烤茄子', meals: ['dinner', 'night'], search: '烤茄子' },
  { name: '铁板鱿鱼', meals: ['dinner', 'night'], search: '铁板鱿鱼' },
  { name: '烤冷面', meals: ['dinner', 'night'], search: '烤冷面' },

  // ── 小吃 ──
  { name: '肉夹馍', meals: ['lunch', 'dinner', 'night'], search: '肉夹馍' },
  { name: '凉皮', meals: ['lunch', 'dinner'], search: '凉皮' },
  { name: '臭豆腐', meals: ['dinner', 'night'], search: '臭豆腐' },
  { name: '手抓饼', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '手抓饼' },
  { name: '狼牙土豆', meals: ['dinner', 'night'], search: '狼牙土豆' },

  // ── 火锅 ──
  { name: '重庆火锅', meals: ['dinner', 'night'], search: '重庆火锅' },
  { name: '串串香', meals: ['dinner', 'night'], search: '串串香' },

  // ── 地方特色 ──
  { name: '北京烤鸭卷饼', meals: ['lunch', 'dinner'], search: '北京烤鸭' },
  { name: '白切鸡', meals: ['lunch', 'dinner'], search: '白切鸡' },
  { name: '大盘鸡', meals: ['lunch', 'dinner'], search: '新疆大盘鸡' },
  { name: '剁椒鱼头', meals: ['lunch', 'dinner'], search: '剁椒鱼头' },
  { name: '东北乱炖', meals: ['lunch', 'dinner'], search: '东北乱炖' },

  // ── 通用快餐 ──
  { name: '两荤一素快餐', meals: ['lunch', 'dinner'], search: '快餐盒饭' },
  { name: '三荤一素套餐', meals: ['lunch', 'dinner'], search: '中式快餐' },
  { name: '称菜自选', meals: ['lunch', 'dinner'], search: '食堂自选菜' },
]

const DRINKS: Dish[] = [
  { name: '珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: '珍珠奶茶' },
  { name: '黑糖珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: '黑糖珍珠奶茶' },
  { name: '椰果奶茶', meals: ['lunch', 'dinner', 'night'], search: '椰果奶茶' },
  { name: '芋圆奶茶', meals: ['lunch', 'dinner', 'night'], search: '芋圆奶茶' },
  { name: '抹茶奶茶', meals: ['lunch', 'dinner'], search: '抹茶奶茶' },
  { name: '杨枝甘露', meals: ['lunch', 'dinner', 'night'], search: '杨枝甘露' },
  { name: '烧仙草', meals: ['lunch', 'dinner', 'night'], search: '烧仙草' },
  { name: '冰粉', meals: ['dinner', 'night'], search: '冰粉' },
  { name: '双皮奶', meals: ['dinner', 'night'], search: '双皮奶' },
  { name: '柠檬水', meals: ['lunch', 'dinner', 'night'], search: '柠檬水' },
  { name: '金桔柠檬', meals: ['lunch', 'dinner', 'night'], search: '金桔柠檬' },

  { name: '鲜榨橙汁', meals: ['breakfast', 'lunch', 'dinner'], search: '鲜榨橙汁' },
  { name: '西瓜汁', meals: ['dinner', 'night'], search: '西瓜汁' },
  { name: '芒果汁', meals: ['lunch', 'dinner'], search: '芒果汁' },
  { name: '草莓汁', meals: ['lunch', 'dinner'], search: '草莓汁' },

  { name: '美式咖啡', meals: ['breakfast', 'lunch'], search: '美式咖啡' },
  { name: '拿铁', meals: ['breakfast', 'lunch', 'dinner'], search: '拿铁咖啡' },
  { name: '生椰拿铁', meals: ['lunch', 'dinner'], search: '生椰拿铁' },
  { name: '卡布奇诺', meals: ['breakfast', 'lunch'], search: '卡布奇诺' },
  { name: '冰美式', meals: ['lunch', 'dinner'], search: '冰美式' },

  { name: '冰红茶', meals: ['lunch', 'dinner', 'night'], search: '冰红茶' },
  { name: '茉莉花茶', meals: ['breakfast', 'lunch', 'dinner'], search: '茉莉花茶' },
  { name: '蜜桃乌龙茶', meals: ['lunch', 'dinner'], search: '蜜桃乌龙茶' },
  { name: '乌龙茶', meals: ['lunch', 'dinner'], search: '乌龙茶' },

  { name: '酸奶', meals: ['breakfast', 'lunch', 'dinner'], search: '酸奶' },
  { name: '养乐多', meals: ['lunch', 'dinner'], search: '养乐多' },

  { name: '冰可乐', meals: ['lunch', 'dinner', 'night'], search: '冰可乐' },
  { name: '雪碧', meals: ['lunch', 'dinner', 'night'], search: '雪碧饮料' },
  { name: '北冰洋', meals: ['lunch', 'dinner', 'night'], search: '北冰洋汽水' },

  { name: '青岛啤酒', meals: ['dinner', 'night'], search: '青岛啤酒' },
  { name: '雪花啤酒', meals: ['dinner', 'night'], search: '雪花啤酒' },
  { name: '江小白', meals: ['dinner', 'night'], search: '江小白' },

  { name: '酸梅汤', meals: ['lunch', 'dinner', 'night'], search: '酸梅汤' },
  { name: '椰汁', meals: ['lunch', 'dinner', 'night'], search: '椰汁饮料' },

  { name: '矿泉水', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '矿泉水' },
  { name: '凉白开', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: '白开水杯子' },
]

interface CachedItem {
  name: string
  imageUrl: string
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* ── 根据当前时间返回适合的时段 ── */
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

  /* ── 根据时段过滤菜品 ── */
  function filterDishes(list: Dish[]): Dish[] {
    if (!config.timeFilter) return list
    const meal = currentMeal()
    const filtered = list.filter(d => d.meals.includes(meal))
    // 如果当前时段没有匹配的，回退到全部
    return filtered.length ? filtered : list
  }

  /* ── 从 Bing 搜索图片 ── */
  async function searchBing(searchTerm: string): Promise<string | null> {
    try {
      const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(searchTerm + ' 美食')}&count=5&mkt=zh-CN&size=Medium`
      const res = await ctx.http.get<{
        value?: Array<{ contentUrl: string; thumbnailUrl: string }>
      }>(url, {
        headers: { 'Ocp-Apim-Subscription-Key': config.bingKey },
        responseType: 'json',
        timeout: 10000,
      })
      const imgs = res?.value
      if (!imgs?.length) return null
      return pickOne(imgs).contentUrl || pickOne(imgs).thumbnailUrl
    } catch (e) {
      logger.debug(`Bing 搜索失败 [${searchTerm}]:`, e)
      return null
    }
  }

  /* ── 刷新缓存 ── */
  async function refreshCache() {
    if (refreshing) return
    refreshing = true
    try {
      // 食物：只搜当前时段相关的
      const foods: CachedItem[] = []
      const fDishes = filterDishes(FOODS)
      // 去重搜索词，每个词只搜一次
      const fSeen = new Set<string>()
      for (const d of fDishes) {
        if (fSeen.has(d.search)) continue
        fSeen.add(d.search)
        const img = await searchBing(d.search)
        if (img) {
          // 所有用同一个搜索词的菜共享这张图
          for (const dd of fDishes.filter(x => x.search === d.search)) {
            foods.push({ name: dd.name, imageUrl: img })
          }
        }
      }
      if (foods.length) foodCache = foods

      // 饮品
      const drinks: CachedItem[] = []
      const dDishes = filterDishes(DRINKS)
      const dSeen = new Set<string>()
      for (const d of dDishes) {
        if (dSeen.has(d.search)) continue
        dSeen.add(d.search)
        const img = await searchBing(d.search)
        if (img) {
          for (const dd of dDishes.filter(x => x.search === d.search)) {
            drinks.push({ name: dd.name, imageUrl: img })
          }
        }
      }
      if (drinks.length) drinkCache = drinks

      const mealName = { breakfast: '早餐时段', lunch: '午餐时段', dinner: '晚餐时段', night: '夜宵时段' }[currentMeal()]
      logger.info(`缓存刷新（${mealName}）：食物 ${foodCache.length} 条，饮品 ${drinkCache.length} 条`)
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

  /* ── 启动 + 定时刷新 ── */
  refreshCache()
  // 每 3 小时刷新（时段变了自动跟）
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

  logger.info(`已启动：${FOODS.length} 种食物，${DRINKS.length} 种饮品，时段过滤${config.timeFilter ? '开' : '关'}`)
}
