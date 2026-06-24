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

/* ────── 美食库：大类搜图 + 具体菜名 ──────
 * Pexels 对中餐覆盖差，所以按大类搜（Chinese noodle / dumpling / stir fry 等），
 * 图是大类通用的，菜名是具体中文的，图能沾边就行。
 */

interface FoodGroup {
  search: string    // Pexels 搜索词（英语大类，保证有结果）
  dishes: string[]  // 具体菜名（显示用）
}

const FOOD_GROUPS: FoodGroup[] = [
  {
    search: 'Chinese noodle soup',
    dishes: ['兰州拉面', '红烧牛肉面', '重庆小面', '担担面', '阳春面', '雪菜肉丝面', '肥肠面', '排骨面', '牛腩面', '片儿川'],
  },
  {
    search: 'Chinese stir fried noodles chow mein',
    dishes: ['炒面', '干炒牛河', '海鲜炒面', '炒河粉', '星洲炒米', '豉油皇炒面'],
  },
  {
    search: 'Chinese noodles with sauce',
    dishes: ['炸酱面', '油泼面', '葱油拌面', '热干面', '燃面', '臊子面'],
  },
  {
    search: 'Chinese fried rice',
    dishes: ['蛋炒饭', '扬州炒饭', '虾仁炒饭', '酱油炒饭', '菠萝炒饭', '咖喱炒饭', '腊肉炒饭', '什锦炒饭', '老干妈炒饭'],
  },
  {
    search: 'Chinese rice bowl dish',
    dishes: ['宫保鸡丁盖饭', '鱼香肉丝盖饭', '红烧肉盖饭', '番茄鸡蛋盖饭', '回锅肉盖饭', '麻婆豆腐盖饭', '糖醋里脊盖饭', '土豆牛肉盖饭', '肉末茄子盖饭'],
  },
  {
    search: 'Chinese dumplings',
    dishes: ['猪肉大葱水饺', '韭菜鸡蛋水饺', '三鲜水饺', '煎饺', '锅贴', '蒸饺', '酸汤水饺'],
  },
  {
    search: 'Chinese steamed buns bao',
    dishes: ['小笼包', '鲜肉包子', '生煎包', '叉烧包', '灌汤包', '花卷', '馒头'],
  },
  {
    search: 'Chinese wonton soup',
    dishes: ['馄饨', '红油抄手', '云吞面', '鲜虾云吞'],
  },
  {
    search: 'Chinese stir fry dish',
    dishes: ['宫保鸡丁', '鱼香肉丝', '麻婆豆腐', '西红柿炒鸡蛋', '地三鲜', '手撕包菜', '蒜蓉西兰花', '蚝油生菜', '醋溜白菜', '虎皮青椒', '干煸四季豆'],
  },
  {
    search: 'Chinese spicy hotpot',
    dishes: ['重庆老火锅', '麻辣火锅', '串串香', '钵钵鸡', '麻辣烫', '冒菜', '关东煮'],
  },
  {
    search: 'Chinese BBQ grilled meat skewers',
    dishes: ['烤羊肉串', '烤鸡翅', '烤面筋', '烤茄子', '烤鱿鱼', '铁板鱿鱼'],
  },
  {
    search: 'fried chicken crispy',
    dishes: ['炸鸡排', '炸鸡腿', '炸鸡米花', '炸春卷', '炸鲜奶'],
  },
  {
    search: 'Chinese street food snack',
    dishes: ['煎饼果子', '烤冷面', '臭豆腐', '狼牙土豆', '凉皮', '肉夹馍'],
  },
  {
    search: 'Chinese breakfast food',
    dishes: ['油条豆浆', '豆腐脑', '鸡蛋灌饼', '手抓饼', '茶叶蛋', '糯米饭团', '烧麦'],
  },
  {
    search: 'Chinese rice porridge congee',
    dishes: ['皮蛋瘦肉粥', '香菇鸡肉粥', '八宝粥', '小米南瓜粥', '白粥配榨菜'],
  },
  {
    search: 'Chinese claypot rice',
    dishes: ['煲仔饭', '腊味合蒸饭', '黄焖鸡米饭', '砂锅豆腐', '砂锅米线'],
  },
  {
    search: 'Chinese rice noodles soup',
    dishes: ['云南过桥米线', '桂林米粉', '螺蛳粉', '酸辣粉', '鸭血粉丝汤'],
  },
  {
    search: 'Chinese cold appetizer salad',
    dishes: ['拍黄瓜', '皮蛋豆腐', '凉拌木耳', '凉拌腐竹', '夫妻肺片', '泡菜'],
  },
  {
    search: 'Peking duck Chinese dish',
    dishes: ['北京烤鸭卷饼', '锅包肉', '水煮肉片', '白切鸡', '小鸡炖蘑菇', '大盘鸡', '叉烧饭'],
  },
  {
    search: 'Chinese pork braised meat',
    dishes: ['红烧肉', '东坡肉', '回锅肉', '糖醋里脊', '木须肉', '农家小炒肉', '粉蒸肉'],
  },
  {
    search: 'Chinese tofu dish',
    dishes: ['麻婆豆腐', '家常豆腐', '皮蛋豆腐', '砂锅豆腐', '红烧豆腐', '葱烧豆腐'],
  },
  {
    search: 'Chinese lunch box meal',
    dishes: ['两荤一素快餐', '三荤一素套餐', '食堂快餐', '盒饭', '便当', '称菜自选'],
  },
  {
    search: 'Chinese vegetable stir fry',
    dishes: ['酸辣土豆丝', '青椒土豆丝', '干锅花菜', '茄子煲', '蒜薹肉丝', '尖椒炒蛋', '韭菜炒鸡蛋'],
  },
  {
    search: 'Chinese soup hot bowl',
    dishes: ['酸辣汤', '紫菜蛋花汤', '番茄蛋汤', '排骨汤', '鸡汤', '冬瓜汤'],
  },
]

const DRINK_GROUPS: { search: string; dishes: string[] }[] = [
  {
    search: 'bubble tea boba drink',
    dishes: ['珍珠奶茶', '黑糖珍珠奶茶', '椰果奶茶', '芋圆奶茶', '红豆奶茶', '布丁奶茶'],
  },
  {
    search: 'matcha latte tea drink',
    dishes: ['抹茶奶茶', '拿铁咖啡', '生椰拿铁', '鸳鸯奶茶'],
  },
  {
    search: 'mango smoothie fruit drink',
    dishes: ['杨枝甘露', '芒果汁', '芒果养乐多'],
  },
  {
    search: 'fresh fruit juice glass',
    dishes: ['鲜榨橙汁', '西瓜汁', '草莓汁', '葡萄汁', '雪梨汁'],
  },
  {
    search: 'iced coffee cold brew',
    dishes: ['美式咖啡', '冷萃咖啡', '冰拿铁', '生椰拿铁'],
  },
  {
    search: 'cappuccino latte coffee',
    dishes: ['拿铁', '卡布奇诺', '摩卡', '澳白'],
  },
  {
    search: 'iced tea lemon glass',
    dishes: ['冰红茶', '冰绿茶', '柠檬茶', '蜜桃乌龙茶'],
  },
  {
    search: 'Chinese tea cup',
    dishes: ['茉莉花茶', '乌龙茶', '铁观音', '大麦茶', '菊花茶', '桂花绿茶'],
  },
  {
    search: 'yogurt drink cup',
    dishes: ['酸奶', '草莓酸奶', '黄桃酸奶', '养乐多'],
  },
  {
    search: 'cola soda glass ice',
    dishes: ['冰可乐', '雪碧', '芬达', '北冰洋', '冰峰'],
  },
  {
    search: 'beer glass pub',
    dishes: ['青岛啤酒', '雪花啤酒', '哈尔滨啤酒', '勇闯天涯'],
  },
  {
    search: 'Chinese dessert sweet soup',
    dishes: ['烧仙草', '双皮奶', '冰粉', '凉虾', '四果汤', '银耳汤'],
  },
  {
    search: 'sparkling water mineral',
    dishes: ['气泡水', '苏打水', '矿泉水', '凉白开'],
  },
]

interface CachedItem {
  cn: string
  imageUrl: string
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('ll-eat')

  let foodCache: CachedItem[] = []
  let drinkCache: CachedItem[] = []
  let refreshing = false

  /* ── 从 Pexels 搜图，返回任意一张 ── */
  async function searchPexels(searchTerm: string): Promise<string | null> {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchTerm)}&per_page=5&orientation=square&size=medium`
      const res = await ctx.http.get<{
        photos?: Array<{ src: { large: string; medium: string } }>
      }>(url, {
        headers: { Authorization: config.pexelsKey },
        responseType: 'json',
        timeout: 10000,
      })
      const photos = res?.photos
      if (!photos?.length) return null
      return pickOne(photos).src.large || pickOne(photos).src.medium
    } catch (e) {
      logger.debug(`Pexels 搜索失败 [${searchTerm}]:`, e)
      return null
    }
  }

  /* ── 刷新缓存：每个大类搜一张图，挂上该类所有菜名 ── */
  async function refreshCache() {
    if (refreshing) return
    refreshing = true
    try {
      // 食物：每个 group 搜一张图
      const foods: CachedItem[] = []
      for (const g of FOOD_GROUPS) {
        const img = await searchPexels(g.search)
        if (img) {
          for (const dish of g.dishes) {
            foods.push({ cn: dish, imageUrl: img })
          }
        }
      }
      if (foods.length) foodCache = foods

      // 饮品：每个 group 搜一张图
      const drinks: CachedItem[] = []
      for (const g of DRINK_GROUPS) {
        const img = await searchPexels(g.search)
        if (img) {
          for (const dish of g.dishes) {
            drinks.push({ cn: dish, imageUrl: img })
          }
        }
      }
      if (drinks.length) drinkCache = drinks

      logger.info(`缓存刷新：食物 ${foodCache.length} 条，饮品 ${drinkCache.length} 条`)
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

  /* ── 启动 + 每4小时刷新 ── */
  refreshCache()
  setInterval(() => refreshCache(), 4 * 60 * 60 * 1000)

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

  logger.info(`已启动：${FOOD_GROUPS.length} 个食物分类，${DRINK_GROUPS.length} 个饮品分类`)
}
