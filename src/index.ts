import { Context, Schema, h } from 'koishi'

export interface Config {
  unsplashKey: string
  timeFilter: boolean
  foodsKeyword: string[]
  drinksKeyword: string[]
}

export const Config: Schema<Config> = Schema.object({
  unsplashKey: Schema.string().role('secret')
    .description('Unsplash Access Key（免费 50次/小时）').required(),
  timeFilter: Schema.boolean()
    .description('按时间段过滤').default(true),
  foodsKeyword: Schema.array(Schema.string()).role('table')
    .description('食物触发词').default(['吃', '吃什么', '吃啥', '中午吃', '晚上吃', '早饭吃', '推荐吃的', '今天吃']),
  drinksKeyword: Schema.array(Schema.string()).role('table')
    .description('饮品触发词').default(['喝', '喝什么', '喝啥', '推荐喝的', '今天喝']),
})

export const name = 'll-eat'

/* ────── 美团级菜单 + Unsplash 多级搜索 ────── */

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'night'

interface Dish {
  name: string                    // 中文菜名
  meals: Meal[]                   // 适合时段
  search: string[]                // Unsplash 搜索词：中文 → 英文（依次尝试）
}

const FOODS: Dish[] = [
  // ─ 早餐 ─
  { name: '油条豆浆', meals: ['breakfast'], search: ['油条', 'Chinese breakfast youtiao'] },
  { name: '豆腐脑', meals: ['breakfast'], search: ['豆腐脑', 'tofu pudding Chinese'] },
  { name: '煎饼果子', meals: ['breakfast', 'lunch'], search: ['煎饼果子', 'Chinese crepe jianbing'] },
  { name: '鸡蛋灌饼', meals: ['breakfast', 'lunch'], search: ['鸡蛋灌饼', 'Chinese egg pancake'] },
  { name: '包子', meals: ['breakfast', 'lunch', 'dinner'], search: ['包子', 'Chinese steamed bun'] },
  { name: '肠粉', meals: ['breakfast', 'lunch'], search: ['肠粉', 'rice noodle roll cheung fun'] },
  { name: '茶叶蛋', meals: ['breakfast', 'lunch'], search: ['茶叶蛋', 'Chinese tea egg'] },
  { name: '烧麦', meals: ['breakfast', 'lunch'], search: ['烧麦', 'shumai dumpling'] },
  { name: '肉粽', meals: ['breakfast'], search: ['粽子', 'zongzi rice dumpling'] },
  { name: '小笼包', meals: ['breakfast', 'lunch', 'dinner'], search: ['小笼包', 'xiaolongbao dumpling'] },
  { name: '蒸饺', meals: ['breakfast', 'lunch', 'dinner'], search: ['蒸饺', 'steamed dumpling'] },
  { name: '皮蛋瘦肉粥', meals: ['breakfast', 'dinner', 'night'], search: ['皮蛋瘦肉粥', 'congee porridge'] },
  { name: '八宝粥', meals: ['breakfast', 'night'], search: ['八宝粥', 'mixed grain porridge'] },
  { name: '手抓饼', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: ['手抓饼', 'Chinese pancake'] },

  // ─ 盖饭/拌饭 ─
  { name: '黄焖鸡米饭', meals: ['lunch', 'dinner'], search: ['黄焖鸡', 'braised chicken rice'] },
  { name: '宫保鸡丁盖饭', meals: ['lunch', 'dinner'], search: ['宫保鸡丁', 'kung pao chicken'] },
  { name: '鱼香肉丝盖饭', meals: ['lunch', 'dinner'], search: ['鱼香肉丝', 'Chinese shredded pork'] },
  { name: '红烧肉盖饭', meals: ['lunch', 'dinner'], search: ['红烧肉', 'braised pork belly'] },
  { name: '番茄鸡蛋盖饭', meals: ['lunch', 'dinner'], search: ['番茄炒蛋', 'tomato scrambled egg'] },
  { name: '土豆牛肉盖饭', meals: ['lunch', 'dinner'], search: ['土豆烧牛肉', 'potato beef stew'] },
  { name: '回锅肉盖饭', meals: ['lunch', 'dinner'], search: ['回锅肉', 'twice cooked pork'] },
  { name: '糖醋里脊盖饭', meals: ['lunch', 'dinner'], search: ['糖醋里脊', 'sweet sour pork'] },
  { name: '麻婆豆腐盖饭', meals: ['lunch', 'dinner'], search: ['麻婆豆腐', 'mapo tofu'] },
  { name: '卤肉饭', meals: ['lunch', 'dinner'], search: ['卤肉饭', 'braised pork rice'] },
  { name: '咖喱鸡肉饭', meals: ['lunch', 'dinner'], search: ['咖喱鸡', 'curry chicken rice'] },
  { name: '黑椒牛柳盖饭', meals: ['lunch', 'dinner'], search: ['黑椒牛柳', 'beef pepper rice'] },
  { name: '叉烧饭', meals: ['lunch', 'dinner'], search: ['叉烧', 'char siu BBQ pork'] },

  // ─ 炒饭 ─
  { name: '蛋炒饭', meals: ['lunch', 'dinner', 'night'], search: ['蛋炒饭', 'egg fried rice'] },
  { name: '扬州炒饭', meals: ['lunch', 'dinner', 'night'], search: ['扬州炒饭', 'Chinese fried rice'] },
  { name: '虾仁炒饭', meals: ['lunch', 'dinner'], search: ['虾仁炒饭', 'shrimp fried rice'] },
  { name: '酱油炒饭', meals: ['lunch', 'dinner', 'night'], search: ['酱油炒饭', 'soy sauce fried rice'] },
  { name: '咖喱炒饭', meals: ['lunch', 'dinner'], search: ['咖喱炒饭', 'curry fried rice'] },

  // ─ 面 ─
  { name: '兰州拉面', meals: ['lunch', 'dinner', 'night'], search: ['兰州拉面', 'Lanzhou beef noodle'] },
  { name: '红烧牛肉面', meals: ['lunch', 'dinner', 'night'], search: ['红烧牛肉面', 'beef noodle soup'] },
  { name: '重庆小面', meals: ['lunch', 'dinner', 'night'], search: ['重庆小面', 'Chongqing spicy noodle'] },
  { name: '担担面', meals: ['lunch', 'dinner'], search: ['担担面', 'dan dan noodle Sichuan'] },
  { name: '炸酱面', meals: ['lunch', 'dinner'], search: ['炸酱面', 'zhajiang black bean noodle'] },
  { name: '油泼面', meals: ['lunch', 'dinner'], search: ['油泼面', 'Chinese oil spill noodle'] },
  { name: '热干面', meals: ['lunch', 'dinner'], search: ['热干面', 'Wuhan hot dry noodle'] },
  { name: '葱油拌面', meals: ['lunch', 'dinner'], search: ['葱油拌面', 'scallion oil noodle'] },
  { name: '番茄鸡蛋面', meals: ['lunch', 'dinner'], search: ['番茄鸡蛋面', 'tomato egg noodle soup'] },
  { name: '炒面', meals: ['lunch', 'dinner', 'night'], search: ['炒面', 'chow mein stir fry noodle'] },
  { name: '干炒牛河', meals: ['lunch', 'dinner', 'night'], search: ['干炒牛河', 'beef chow fun'] },

  // ─ 粉 ─
  { name: '螺蛳粉', meals: ['lunch', 'dinner', 'night'], search: ['螺蛳粉', 'Luosifen rice noodle'] },
  { name: '酸辣粉', meals: ['lunch', 'dinner', 'night'], search: ['酸辣粉', 'hot sour glass noodle'] },
  { name: '桂林米粉', meals: ['lunch', 'dinner'], search: ['桂林米粉', 'Guilin rice noodle soup'] },
  { name: '过桥米线', meals: ['lunch', 'dinner'], search: ['过桥米线', 'crossing bridge noodle'] },
  { name: '新疆炒米粉', meals: ['lunch', 'dinner', 'night'], search: ['炒米粉', 'rice noodle stir fry'] },
  { name: '花甲粉', meals: ['lunch', 'dinner', 'night'], search: ['花甲粉', 'clam noodle soup'] },

  // ─ 饺子/包子 ─
  { name: '水饺', meals: ['lunch', 'dinner', 'night'], search: ['饺子', 'Chinese dumpling boiled'] },
  { name: '煎饺', meals: ['lunch', 'dinner', 'night'], search: ['煎饺', 'pan fried dumpling'] },
  { name: '生煎包', meals: ['breakfast', 'lunch', 'dinner'], search: ['生煎包', 'sheng jian bao'] },
  { name: '馄饨', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: ['馄饨', 'wonton soup'] },
  { name: '红油抄手', meals: ['lunch', 'dinner', 'night'], search: ['红油抄手', 'chili oil wonton'] },

  // ─ 炒菜 ─
  { name: '西红柿炒鸡蛋', meals: ['lunch', 'dinner'], search: ['西红柿炒鸡蛋', 'tomato scrambled egg Chinese'] },
  { name: '酸辣土豆丝', meals: ['lunch', 'dinner'], search: ['酸辣土豆丝', 'shredded potato stir fry'] },
  { name: '鱼香肉丝', meals: ['lunch', 'dinner'], search: ['鱼香肉丝', 'Chinese garlic shredded pork'] },
  { name: '麻婆豆腐', meals: ['lunch', 'dinner'], search: ['麻婆豆腐', 'mapo tofu Sichuan'] },
  { name: '地三鲜', meals: ['lunch', 'dinner'], search: ['地三鲜', 'potato eggplant pepper stir fry'] },
  { name: '手撕包菜', meals: ['lunch', 'dinner'], search: ['手撕包菜', 'stir fry cabbage'] },
  { name: '干煸四季豆', meals: ['lunch', 'dinner'], search: ['干煸四季豆', 'dry fried green bean'] },
  { name: '家常豆腐', meals: ['lunch', 'dinner'], search: ['家常豆腐', 'Chinese home style tofu'] },
  { name: '蒜蓉西兰花', meals: ['lunch', 'dinner'], search: ['蒜蓉西兰花', 'garlic broccoli stir fry'] },
  { name: '蚝油生菜', meals: ['lunch', 'dinner'], search: ['蚝油生菜', 'oyster sauce lettuce'] },
  { name: '水煮肉片', meals: ['lunch', 'dinner'], search: ['水煮肉片', 'Sichuan boiled beef'] },
  { name: '锅包肉', meals: ['lunch', 'dinner'], search: ['锅包肉', 'guo bao rou crispy pork'] },
  { name: '农家小炒肉', meals: ['lunch', 'dinner'], search: ['小炒肉', 'Chinese stir fry pork chili'] },
  { name: '干锅花菜', meals: ['lunch', 'dinner'], search: ['干锅花菜', 'dry pot cauliflower'] },

  // ─ 煲/粥 ─
  { name: '煲仔饭', meals: ['lunch', 'dinner'], search: ['煲仔饭', 'Chinese claypot rice'] },
  { name: '砂锅米线', meals: ['lunch', 'dinner'], search: ['砂锅米线', 'claypot rice noodle'] },

  // ─ 麻辣烫/冒菜/香锅 ─
  { name: '麻辣烫', meals: ['lunch', 'dinner', 'night'], search: ['麻辣烫', 'malatang spicy soup'] },
  { name: '冒菜', meals: ['lunch', 'dinner', 'night'], search: ['冒菜', 'Sichuan maocai spicy'] },
  { name: '麻辣香锅', meals: ['lunch', 'dinner', 'night'], search: ['麻辣香锅', 'mala spicy stir fry pot'] },
  { name: '关东煮', meals: ['lunch', 'dinner', 'night'], search: ['关东煮', 'oden Japanese fish cake'] },

  // ─ 炸鸡/快餐 ─
  { name: '鸡腿堡', meals: ['lunch', 'dinner', 'night'], search: ['鸡腿堡', 'chicken burger sandwich'] },
  { name: '炸鸡排', meals: ['lunch', 'dinner', 'night'], search: ['炸鸡排', 'fried chicken cutlet'] },
  { name: '韩式炸鸡', meals: ['lunch', 'dinner', 'night'], search: ['韩式炸鸡', 'Korean fried chicken'] },
  { name: '鸡米花', meals: ['lunch', 'dinner', 'night'], search: ['鸡米花', 'popcorn chicken'] },
  { name: '炸薯条', meals: ['lunch', 'dinner', 'night'], search: ['薯条', 'french fries'] },

  // ─ 烧烤/铁板（夜宵） ─
  { name: '烤羊肉串', meals: ['dinner', 'night'], search: ['羊肉串', 'Chinese lamb skewer BBQ'] },
  { name: '烤鸡翅', meals: ['dinner', 'night'], search: ['烤鸡翅', 'grilled chicken wing'] },
  { name: '烤鱿鱼', meals: ['dinner', 'night'], search: ['烤鱿鱼', 'grilled squid skewer'] },
  { name: '烤面筋', meals: ['dinner', 'night'], search: ['烤面筋', 'grilled gluten skewer'] },
  { name: '烤茄子', meals: ['dinner', 'night'], search: ['烤茄子', 'grilled eggplant Chinese'] },
  { name: '铁板鱿鱼', meals: ['dinner', 'night'], search: ['铁板鱿鱼', 'teppanyaki squid'] },
  { name: '烤冷面', meals: ['dinner', 'night'], search: ['烤冷面', 'grilled cold noodle Chinese'] },

  // ─ 小吃 ─
  { name: '肉夹馍', meals: ['lunch', 'dinner', 'night'], search: ['肉夹馍', 'roujiamo Chinese meat burger'] },
  { name: '凉皮', meals: ['lunch', 'dinner'], search: ['凉皮', 'liangpi cold noodle'] },
  { name: '臭豆腐', meals: ['dinner', 'night'], search: ['臭豆腐', 'stinky tofu Chinese'] },
  { name: '狼牙土豆', meals: ['dinner', 'night'], search: ['狼牙土豆', 'crispy potato wedge'] },

  // ─ 火锅 ─
  { name: '重庆火锅', meals: ['dinner', 'night'], search: ['重庆火锅', 'Chinese hotpot Sichuan'] },
  { name: '串串香', meals: ['dinner', 'night'], search: ['串串香', 'chuanchuan skewer hotpot'] },

  // ─ 地方特色 ─
  { name: '北京烤鸭', meals: ['lunch', 'dinner'], search: ['北京烤鸭', 'Peking duck sliced'] },
  { name: '白切鸡', meals: ['lunch', 'dinner'], search: ['白切鸡', 'Cantonese poached chicken'] },
  { name: '新疆大盘鸡', meals: ['lunch', 'dinner'], search: ['大盘鸡', 'big plate chicken Xinjiang'] },
  { name: '猪肉炖粉条', meals: ['lunch', 'dinner'], search: ['猪肉炖粉条', 'Dongbei pork stew vermicelli'] },

  // ─ 快餐 ─
  { name: '两荤一素快餐', meals: ['lunch', 'dinner'], search: ['中式快餐', 'Chinese lunch box meal'] },
  { name: '食堂自选菜', meals: ['lunch', 'dinner'], search: ['食堂菜', 'cafeteria food Chinese'] },
]

const DRINKS: Dish[] = [
  { name: '珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: ['珍珠奶茶', 'bubble tea boba'] },
  { name: '黑糖珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: ['黑糖珍珠奶茶', 'brown sugar boba'] },
  { name: '芋圆奶茶', meals: ['lunch', 'dinner', 'night'], search: ['芋圆奶茶', 'taro bubble tea'] },
  { name: '抹茶奶茶', meals: ['lunch', 'dinner'], search: ['抹茶奶茶', 'matcha latte'] },
  { name: '杨枝甘露', meals: ['lunch', 'dinner', 'night'], search: ['杨枝甘露', 'mango pomelo sago dessert'] },
  { name: '烧仙草', meals: ['dinner', 'night'], search: ['烧仙草', 'grass jelly dessert'] },
  { name: '冰粉', meals: ['dinner', 'night'], search: ['冰粉', 'Chinese ice jelly dessert'] },
  { name: '柠檬水', meals: ['lunch', 'dinner', 'night'], search: ['柠檬水', 'lemonade drink glass'] },
  { name: '鲜榨橙汁', meals: ['breakfast', 'lunch', 'dinner'], search: ['鲜榨橙汁', 'fresh orange juice'] },
  { name: '西瓜汁', meals: ['dinner', 'night'], search: ['西瓜汁', 'watermelon juice fresh'] },
  { name: '芒果汁', meals: ['lunch', 'dinner'], search: ['芒果汁', 'mango juice smoothie'] },
  { name: '美式咖啡', meals: ['breakfast', 'lunch'], search: ['美式咖啡', 'americano coffee black'] },
  { name: '拿铁', meals: ['breakfast', 'lunch', 'dinner'], search: ['拿铁', 'latte coffee art'] },
  { name: '生椰拿铁', meals: ['lunch', 'dinner'], search: ['生椰拿铁', 'coconut latte coffee'] },
  { name: '冰美式', meals: ['lunch', 'dinner'], search: ['冰美式', 'iced americano coffee'] },
  { name: '冰红茶', meals: ['lunch', 'dinner', 'night'], search: ['冰红茶', 'iced lemon tea glass'] },
  { name: '茉莉花茶', meals: ['breakfast', 'lunch', 'dinner'], search: ['茉莉花茶', 'jasmine tea Chinese cup'] },
  { name: '蜜桃乌龙茶', meals: ['lunch', 'dinner'], search: ['蜜桃乌龙', 'peach oolong tea'] },
  { name: '酸奶', meals: ['breakfast', 'lunch', 'dinner'], search: ['酸奶', 'yogurt cup bowl'] },
  { name: '冰可乐', meals: ['lunch', 'dinner', 'night'], search: ['冰可乐', 'coca cola ice glass'] },
  { name: '北冰洋', meals: ['lunch', 'dinner', 'night'], search: ['北冰洋汽水', 'orange soda bottle drink'] },
  { name: '青岛啤酒', meals: ['dinner', 'night'], search: ['青岛啤酒', 'beer glass pub Tsingtao'] },
  { name: '酸梅汤', meals: ['lunch', 'dinner', 'night'], search: ['酸梅汤', 'sour plum drink Chinese'] },
  { name: '椰汁', meals: ['lunch', 'dinner', 'night'], search: ['椰汁', 'coconut water drink'] },
  { name: '矿泉水', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: ['矿泉水', 'mineral water bottle'] },
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

  /* ── Unsplash 多级搜索 ── */
  async function searchUnsplash(queries: string[]): Promise<string | null> {
    for (const q of queries) {
      try {
        const res = await ctx.http.get<{
          results?: Array<{ urls: { regular: string }; links: { download_location: string } }>
        }>(
          'https://api.unsplash.com/search/photos',
          {
            params: { query: q, per_page: 5, orientation: 'squarish' },
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
      } catch { /* 下一个搜索词 */ }
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

      // 食物
      const foods: CachedItem[] = []
      const fDishes = filterDishes(FOODS)
      const fSeen = new Map<string, string>()
      for (const d of fDishes) {
        const key = d.search[0]
        if (fSeen.has(key)) {
          foods.push({ name: d.name, imageUrl: fSeen.get(key)! })
          continue
        }
        const img = await searchUnsplash(d.search)
        if (img) {
          fSeen.set(key, img)
          for (const dd of fDishes.filter(x => x.search[0] === key)) {
            foods.push({ name: dd.name, imageUrl: img })
          }
        }
      }
      if (foods.length) foodCache = foods

      // 饮品
      const drinks: CachedItem[] = []
      const dDishes = filterDishes(DRINKS)
      const dSeen = new Map<string, string>()
      for (const d of dDishes) {
        const key = d.search[0]
        if (dSeen.has(key)) {
          drinks.push({ name: d.name, imageUrl: dSeen.get(key)! })
          continue
        }
        const img = await searchUnsplash(d.search)
        if (img) {
          dSeen.set(key, img)
          for (const dd of dDishes.filter(x => x.search[0] === key)) {
            drinks.push({ name: dd.name, imageUrl: img })
          }
        }
      }
      if (drinks.length) drinkCache = drinks

      logger.info(`[${mealName}] 食物 ${foods.length} 条，饮品 ${drinks.length} 条`)
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

  logger.info(`已启动：${FOODS.length} 食物 ${DRINKS.length} 饮品(Unsplash) 时段${config.timeFilter ? '开' : '关'}`)
}
