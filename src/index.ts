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
    .description('Unsplash Access Key（免费 50次/小时）').required(),
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

/* ────── 美团级菜单 + 多级搜索回退 ────── */

type Meal = 'breakfast' | 'lunch' | 'dinner' | 'night'

interface Dish {
  name: string                    // 中文菜名（显示用）
  meals: Meal[]                   // 适合时段
  search: string[]                // 搜索词：中文 → 拼音 → 英文大类（依次尝试）
}

const FOODS: Dish[] = [
  // ─ 早餐 ─
  { name: '油条豆浆', meals: ['breakfast'], search: ['油条', '油条豆浆', 'Chinese breakfast youtiao'] },
  { name: '豆腐脑', meals: ['breakfast'], search: ['豆腐脑', '豆花', 'tofu pudding'] },
  { name: '煎饼果子', meals: ['breakfast', 'lunch'], search: ['煎饼果子', '煎饼', 'Chinese crepe'] },
  { name: '鸡蛋灌饼', meals: ['breakfast', 'lunch'], search: ['鸡蛋灌饼', '鸡蛋饼', 'Chinese egg pancake'] },
  { name: '包子小米粥', meals: ['breakfast'], search: ['包子', '包子小米粥', 'steamed bun breakfast'] },
  { name: '肠粉', meals: ['breakfast', 'lunch'], search: ['肠粉', 'cheung fun', 'rice noodle roll'] },
  { name: '茶叶蛋', meals: ['breakfast', 'lunch'], search: ['茶叶蛋', '卤蛋', 'tea egg'] },
  { name: '烧麦', meals: ['breakfast', 'lunch'], search: ['烧麦', '烧卖', 'shumai dumpling'] },
  { name: '糯米饭团', meals: ['breakfast'], search: ['饭团', '糯米饭团', 'rice ball'] },
  { name: '肉粽', meals: ['breakfast'], search: ['粽子', '肉粽', 'zongzi rice dumpling'] },
  { name: '小笼包', meals: ['breakfast', 'lunch', 'dinner'], search: ['小笼包', '小笼', 'xiaolongbao'] },
  { name: '蒸饺', meals: ['breakfast', 'lunch', 'dinner'], search: ['蒸饺', '饺子', 'steamed dumpling'] },

  // ─ 盖饭/拌饭 ─
  { name: '黄焖鸡米饭', meals: ['lunch', 'dinner'], search: ['黄焖鸡', '黄焖鸡米饭', 'braised chicken rice'] },
  { name: '宫保鸡丁盖饭', meals: ['lunch', 'dinner'], search: ['宫保鸡丁', 'kung pao chicken'] },
  { name: '鱼香肉丝盖饭', meals: ['lunch', 'dinner'], search: ['鱼香肉丝', 'shredded pork rice'] },
  { name: '红烧肉盖饭', meals: ['lunch', 'dinner'], search: ['红烧肉', '红烧肉盖饭', 'braised pork belly'] },
  { name: '番茄鸡蛋盖饭', meals: ['lunch', 'dinner'], search: ['番茄鸡蛋', '番茄炒蛋', 'tomato egg'] },
  { name: '土豆牛肉盖饭', meals: ['lunch', 'dinner'], search: ['土豆牛肉', '土豆烧牛肉', 'potato beef stew'] },
  { name: '回锅肉盖饭', meals: ['lunch', 'dinner'], search: ['回锅肉', 'twice cooked pork'] },
  { name: '糖醋里脊盖饭', meals: ['lunch', 'dinner'], search: ['糖醋里脊', 'sweet sour pork'] },
  { name: '麻婆豆腐盖饭', meals: ['lunch', 'dinner'], search: ['麻婆豆腐', 'mapo tofu'] },
  { name: '卤肉饭', meals: ['lunch', 'dinner'], search: ['卤肉饭', '卤肉', 'braised pork rice'] },
  { name: '咖喱鸡肉饭', meals: ['lunch', 'dinner'], search: ['咖喱鸡肉', '咖喱鸡饭', 'curry chicken rice'] },
  { name: '黑椒牛柳盖饭', meals: ['lunch', 'dinner'], search: ['黑椒牛柳', '黑椒牛肉', 'beef pepper rice'] },

  // ─ 炒饭 ─
  { name: '蛋炒饭', meals: ['lunch', 'dinner', 'night'], search: ['蛋炒饭', '鸡蛋炒饭', 'egg fried rice'] },
  { name: '扬州炒饭', meals: ['lunch', 'dinner', 'night'], search: ['扬州炒饭', 'fried rice Chinese'] },
  { name: '虾仁炒饭', meals: ['lunch', 'dinner'], search: ['虾仁炒饭', '虾炒饭', 'shrimp fried rice'] },
  { name: '酱油炒饭', meals: ['lunch', 'dinner', 'night'], search: ['酱油炒饭', 'soy sauce fried rice'] },
  { name: '咖喱炒饭', meals: ['lunch', 'dinner'], search: ['咖喱炒饭', 'curry fried rice'] },

  // ─ 面 ─
  { name: '兰州拉面', meals: ['lunch', 'dinner', 'night'], search: ['兰州拉面', '牛肉拉面', 'Lanzhou noodle'] },
  { name: '红烧牛肉面', meals: ['lunch', 'dinner', 'night'], search: ['红烧牛肉面', '牛肉面', 'beef noodle soup'] },
  { name: '重庆小面', meals: ['lunch', 'dinner', 'night'], search: ['重庆小面', '小面', 'Chongqing noodle'] },
  { name: '担担面', meals: ['lunch', 'dinner'], search: ['担担面', 'dan dan noodle'] },
  { name: '炸酱面', meals: ['lunch', 'dinner'], search: ['炸酱面', 'zhajiang noodle', 'black bean noodle'] },
  { name: '油泼面', meals: ['lunch', 'dinner'], search: ['油泼面', 'biang biang noodle'] },
  { name: '热干面', meals: ['lunch', 'dinner'], search: ['热干面', 'hot dry noodle'] },
  { name: '葱油拌面', meals: ['lunch', 'dinner'], search: ['葱油拌面', '葱油面', 'scallion oil noodle'] },
  { name: '番茄鸡蛋面', meals: ['lunch', 'dinner'], search: ['番茄鸡蛋面', '番茄面', 'tomato egg noodle'] },
  { name: '炒面', meals: ['lunch', 'dinner', 'night'], search: ['炒面', 'chow mein'] },
  { name: '干炒牛河', meals: ['lunch', 'dinner', 'night'], search: ['干炒牛河', '河粉', 'beef chow fun'] },

  // ─ 粉 ─
  { name: '螺蛳粉', meals: ['lunch', 'dinner', 'night'], search: ['螺蛳粉', '螺蛳粉', 'snail noodle'] },
  { name: '酸辣粉', meals: ['lunch', 'dinner', 'night'], search: ['酸辣粉', '酸辣粉', 'hot sour noodle'] },
  { name: '桂林米粉', meals: ['lunch', 'dinner'], search: ['桂林米粉', '米粉', 'rice noodle soup'] },
  { name: '过桥米线', meals: ['lunch', 'dinner'], search: ['过桥米线', '米线', 'crossing bridge noodle'] },
  { name: '新疆炒米粉', meals: ['lunch', 'dinner', 'night'], search: ['新疆炒米粉', '炒米粉', 'rice noodle stir fry'] },
  { name: '花甲粉', meals: ['lunch', 'dinner', 'night'], search: ['花甲粉', '花甲', 'clam noodle'] },

  // ─ 饺子/包子 ─
  { name: '水饺', meals: ['lunch', 'dinner', 'night'], search: ['水饺', '饺子', 'Chinese dumpling'] },
  { name: '煎饺', meals: ['lunch', 'dinner', 'night'], search: ['煎饺', '锅贴', 'pan fried dumpling'] },
  { name: '生煎包', meals: ['breakfast', 'lunch', 'dinner'], search: ['生煎包', '生煎', 'sheng jian bao'] },
  { name: '鲜肉包子', meals: ['breakfast', 'lunch', 'dinner'], search: ['包子', '鲜肉包', 'steamed pork bun'] },
  { name: '馄饨', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: ['馄饨', '抄手', 'wonton soup'] },
  { name: '红油抄手', meals: ['lunch', 'dinner', 'night'], search: ['红油抄手', '抄手', 'chili wonton'] },

  // ─ 炒菜 ─
  { name: '西红柿炒鸡蛋', meals: ['lunch', 'dinner'], search: ['西红柿炒鸡蛋', '番茄炒蛋', 'tomato scrambled egg'] },
  { name: '酸辣土豆丝', meals: ['lunch', 'dinner'], search: ['酸辣土豆丝', '土豆丝', 'shredded potato'] },
  { name: '宫保鸡丁', meals: ['lunch', 'dinner'], search: ['宫保鸡丁', '宫保鸡', 'kung pao chicken'] },
  { name: '鱼香肉丝', meals: ['lunch', 'dinner'], search: ['鱼香肉丝', '鱼香肉丝', 'shredded pork garlic'] },
  { name: '麻婆豆腐', meals: ['lunch', 'dinner'], search: ['麻婆豆腐', '麻婆豆腐', 'mapo tofu'] },
  { name: '地三鲜', meals: ['lunch', 'dinner'], search: ['地三鲜', '地三鲜', 'stir fry potato eggplant'] },
  { name: '手撕包菜', meals: ['lunch', 'dinner'], search: ['手撕包菜', '包菜', 'stir fry cabbage'] },
  { name: '干煸四季豆', meals: ['lunch', 'dinner'], search: ['干煸四季豆', '四季豆', 'stir fry green bean'] },
  { name: '家常豆腐', meals: ['lunch', 'dinner'], search: ['家常豆腐', '豆腐', 'home style tofu'] },
  { name: '蒜蓉西兰花', meals: ['lunch', 'dinner'], search: ['蒜蓉西兰花', '西兰花', 'broccoli garlic stir fry'] },
  { name: '蚝油生菜', meals: ['lunch', 'dinner'], search: ['蚝油生菜', '生菜', 'lettuce oyster sauce'] },
  { name: '水煮肉片', meals: ['lunch', 'dinner'], search: ['水煮肉片', '水煮肉', 'Sichuan boiled beef'] },
  { name: '锅包肉', meals: ['lunch', 'dinner'], search: ['锅包肉', '锅包肉', 'guo bao rou'] },
  { name: '农家小炒肉', meals: ['lunch', 'dinner'], search: ['农家小炒肉', '小炒肉', 'stir fry pork chili'] },
  { name: '干锅花菜', meals: ['lunch', 'dinner'], search: ['干锅花菜', '花菜', 'dry pot cauliflower'] },

  // ─ 煲/粥 ─
  { name: '煲仔饭', meals: ['lunch', 'dinner'], search: ['煲仔饭', '煲仔饭', 'claypot rice'] },
  { name: '砂锅米线', meals: ['lunch', 'dinner'], search: ['砂锅米线', '砂锅', 'claypot noodle'] },
  { name: '皮蛋瘦肉粥', meals: ['breakfast', 'dinner', 'night'], search: ['皮蛋瘦肉粥', '粥', 'congee'] },
  { name: '八宝粥', meals: ['breakfast', 'night'], search: ['八宝粥', 'mixed congee'] },
  { name: '小米南瓜粥', meals: ['breakfast', 'dinner'], search: ['小米南瓜粥', '南瓜粥', 'pumpkin porridge'] },

  // ─ 麻辣烫/冒菜/香锅 ─
  { name: '麻辣烫', meals: ['lunch', 'dinner', 'night'], search: ['麻辣烫', '麻辣烫', 'malatang'] },
  { name: '冒菜', meals: ['lunch', 'dinner', 'night'], search: ['冒菜', '冒菜', 'maocai Sichuan'] },
  { name: '麻辣香锅', meals: ['lunch', 'dinner', 'night'], search: ['麻辣香锅', '香锅', 'mala spicy pot'] },
  { name: '关东煮', meals: ['lunch', 'dinner', 'night'], search: ['关东煮', '关东煮', 'oden'] },

  // ─ 炸鸡/快餐 ─
  { name: '香辣鸡腿堡', meals: ['lunch', 'dinner', 'night'], search: ['鸡腿堡', '汉堡', 'chicken burger'] },
  { name: '炸鸡排', meals: ['lunch', 'dinner', 'night'], search: ['炸鸡排', '鸡排', 'fried chicken cutlet'] },
  { name: '韩式炸鸡', meals: ['lunch', 'dinner', 'night'], search: ['韩式炸鸡', '炸鸡', 'Korean fried chicken'] },
  { name: '鸡米花', meals: ['lunch', 'dinner', 'night'], search: ['鸡米花', 'popcorn chicken'] },
  { name: '炸薯条', meals: ['lunch', 'dinner', 'night'], search: ['薯条', 'french fries'] },

  // ─ 烧烤/铁板（侧重夜宵） ─
  { name: '烤羊肉串', meals: ['dinner', 'night'], search: ['羊肉串', '烤羊肉', 'lamb skewer'] },
  { name: '烤鸡翅', meals: ['dinner', 'night'], search: ['烤鸡翅', '烤翅', 'grilled chicken wing'] },
  { name: '烤鱿鱼', meals: ['dinner', 'night'], search: ['烤鱿鱼', '鱿鱼', 'grilled squid'] },
  { name: '烤面筋', meals: ['dinner', 'night'], search: ['烤面筋', '面筋', 'grilled gluten'] },
  { name: '烤茄子', meals: ['dinner', 'night'], search: ['烤茄子', 'grilled eggplant'] },
  { name: '铁板鱿鱼', meals: ['dinner', 'night'], search: ['铁板鱿鱼', 'teppanyaki squid'] },
  { name: '烤冷面', meals: ['dinner', 'night'], search: ['烤冷面', '烤冷面', 'grilled cold noodle'] },

  // ─ 小吃 ─
  { name: '肉夹馍', meals: ['lunch', 'dinner', 'night'], search: ['肉夹馍', '肉夹馍', 'roujiamo Chinese burger'] },
  { name: '凉皮', meals: ['lunch', 'dinner'], search: ['凉皮', '凉皮', 'liangpi cold noodle'] },
  { name: '臭豆腐', meals: ['dinner', 'night'], search: ['臭豆腐', 'stinky tofu'] },
  { name: '手抓饼', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: ['手抓饼', '手抓饼', 'Chinese pancake'] },
  { name: '狼牙土豆', meals: ['dinner', 'night'], search: ['狼牙土豆', '土豆条', 'crispy potato'] },
  { name: '煎饼果子', meals: ['breakfast', 'lunch'], search: ['煎饼果子', '煎饼', 'jianbing'] },

  // ─ 火锅 ─
  { name: '重庆火锅', meals: ['dinner', 'night'], search: ['重庆火锅', '火锅', 'Chinese hotpot'] },
  { name: '串串香', meals: ['dinner', 'night'], search: ['串串香', '串串', 'chuanchuan skewer'] },

  // ─ 地方特色 ─
  { name: '北京烤鸭', meals: ['lunch', 'dinner'], search: ['北京烤鸭', '烤鸭', 'Peking duck'] },
  { name: '白切鸡', meals: ['lunch', 'dinner'], search: ['白切鸡', '白斩鸡', 'Cantonese chicken'] },
  { name: '大盘鸡', meals: ['lunch', 'dinner'], search: ['大盘鸡', '新疆大盘鸡', 'big plate chicken'] },
  { name: '叉烧饭', meals: ['lunch', 'dinner'], search: ['叉烧', '叉烧饭', 'char siu rice'] },

  // ─ 快餐 ─
  { name: '两荤一素快餐', meals: ['lunch', 'dinner'], search: ['快餐', '中式快餐', 'Chinese lunch box'] },
  { name: '三荤一素套餐', meals: ['lunch', 'dinner'], search: ['套餐', '盒饭', 'Chinese combo meal'] },
]

const DRINKS: Dish[] = [
  { name: '珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: ['珍珠奶茶', 'bubble tea'] },
  { name: '黑糖珍珠奶茶', meals: ['lunch', 'dinner', 'night'], search: ['黑糖珍珠', 'brown sugar boba'] },
  { name: '椰果奶茶', meals: ['lunch', 'dinner', 'night'], search: ['椰果奶茶', 'coconut jelly tea'] },
  { name: '芋圆奶茶', meals: ['lunch', 'dinner', 'night'], search: ['芋圆奶茶', 'taro ball tea'] },
  { name: '抹茶奶茶', meals: ['lunch', 'dinner'], search: ['抹茶奶茶', 'matcha latte'] },
  { name: '杨枝甘露', meals: ['lunch', 'dinner', 'night'], search: ['杨枝甘露', 'mango sago'] },
  { name: '烧仙草', meals: ['dinner', 'night'], search: ['烧仙草', 'grass jelly dessert'] },
  { name: '冰粉', meals: ['dinner', 'night'], search: ['冰粉', 'bingfen ice jelly'] },
  { name: '柠檬水', meals: ['lunch', 'dinner', 'night'], search: ['柠檬水', 'lemonade'] },
  { name: '金桔柠檬', meals: ['lunch', 'dinner', 'night'], search: ['金桔柠檬', 'kumquat lemon'] },
  { name: '鲜榨橙汁', meals: ['breakfast', 'lunch', 'dinner'], search: ['鲜榨橙汁', 'orange juice'] },
  { name: '西瓜汁', meals: ['dinner', 'night'], search: ['西瓜汁', 'watermelon juice'] },
  { name: '芒果汁', meals: ['lunch', 'dinner'], search: ['芒果汁', 'mango juice'] },
  { name: '美式咖啡', meals: ['breakfast', 'lunch'], search: ['美式咖啡', 'americano coffee'] },
  { name: '拿铁', meals: ['breakfast', 'lunch', 'dinner'], search: ['拿铁', 'latte coffee'] },
  { name: '生椰拿铁', meals: ['lunch', 'dinner'], search: ['生椰拿铁', 'coconut latte'] },
  { name: '冰美式', meals: ['lunch', 'dinner'], search: ['冰美式', 'iced americano'] },
  { name: '冰红茶', meals: ['lunch', 'dinner', 'night'], search: ['冰红茶', 'iced tea'] },
  { name: '茉莉花茶', meals: ['breakfast', 'lunch', 'dinner'], search: ['茉莉花茶', 'jasmine tea'] },
  { name: '蜜桃乌龙茶', meals: ['lunch', 'dinner'], search: ['蜜桃乌龙', 'peach oolong tea'] },
  { name: '酸奶', meals: ['breakfast', 'lunch', 'dinner'], search: ['酸奶', 'yogurt'] },
  { name: '冰可乐', meals: ['lunch', 'dinner', 'night'], search: ['冰可乐', 'coca cola'] },
  { name: '北冰洋', meals: ['lunch', 'dinner', 'night'], search: ['北冰洋汽水', 'orange soda'] },
  { name: '青岛啤酒', meals: ['dinner', 'night'], search: ['青岛啤酒', 'tsingtao beer'] },
  { name: '酸梅汤', meals: ['lunch', 'dinner', 'night'], search: ['酸梅汤', 'sour plum drink'] },
  { name: '椰汁', meals: ['lunch', 'dinner', 'night'], search: ['椰汁', 'coconut water'] },
  { name: '矿泉水', meals: ['breakfast', 'lunch', 'dinner', 'night'], search: ['矿泉水', 'mineral water'] },
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
          const img = pickOne(results)
          // 触发下载计数
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
      const foods: CachedItem[] = []
      const fDishes = filterDishes(FOODS)
      const fSeen = new Map<string, string>() // search[0] → imageUrl
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

      const mealName = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', night: '夜宵' }[currentMeal()]
      logger.info(`缓存刷新（${mealName}）：食物 ${foodCache.length} 条，饮品 ${drinkCache.length} 条`)
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
    const cmd = ctx.command(config.commandName)
      .alias('吃', '喝', '吃啥', '喝啥', '吃什么', '喝什么')
    cmd.subcommand('.food', '今天吃什么').action(async () => sendFood())
    cmd.subcommand('.drink', '今天喝什么').action(async () => sendDrink())
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

  logger.info(`已启动：${FOODS.length} 食物 ${DRINKS.length} 饮品，时段${config.timeFilter ? '过滤开' : '关'}`)
}
