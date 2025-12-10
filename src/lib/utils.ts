export function isNonNegativeInteger(str: string): boolean {
  return /^\d+$/.test(str);
}

export function shallowEqual<T extends object>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;
  
  // 首先检查键的数量是否相同
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  // 然后逐个比较键值对
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}
export class SeededRandom {
  private seed: number;
  private readonly m: number = 0x80000000; // 2^31
  private readonly a: number = 1103515245;
  private readonly c: number = 12345;

  constructor(seed?: number) {
    this.seed = seed || Date.now();
  }

  /**
   * 生成0-1之间的随机数
   * @returns 0到1之间的随机浮点数
   */
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / (this.m - 1);
  }

  /**
   * 生成指定范围的随机整数
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @returns [min, max] 范围内的随机整数
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error('min must be less than or equal to max');
    }
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * 生成指定范围的随机浮点数
   * @param min 最小值（包含）
   * @param max 最大值（不包含）
   * @returns [min, max) 范围内的随机浮点数
   */
  nextFloat(min: number, max: number): number {
    if (min >= max) {
      throw new Error('min must be less than max');
    }
    return this.next() * (max - min) + min;
  }

  /**
   * 生成固定长度的随机数序列
   * @param length 序列长度
   * @param min 最小值
   * @param max 最大值
   * @param type 生成类型：'integer' 或 'float'
   * @returns 随机数数组
   */
  generateSequence(
    length: number,
    min: number = 0,
    max: number = 1,
    type: 'integer' | 'float' = 'integer'
  ): number[] {
    const sequence: number[] = [];

    for (let i = 0; i < length; i++) {
      if (type === 'integer') {
        sequence.push(this.nextInt(min, max));
      } else {
        sequence.push(this.nextFloat(min, max));
      }
    }

    return sequence;
  }

  /**
   * 重置种子
   * @param newSeed 新的种子值
   */
  reset(newSeed?: number): void {
    this.seed = newSeed || Date.now();
  }

  /**
   * 获取当前种子值
   * @returns 当前种子
   */
  getSeed(): number {
    return this.seed;
  }

  /**
   * 生成随机布尔值
   * @param probability 为 true 的概率，默认 0.5
   * @returns 随机布尔值
   */
  nextBoolean(probability: number = 0.5): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error('probability must be between 0 and 1');
    }
    return this.next() < probability;
  }

  /**
   * 从数组中随机选择元素
   * @param array 源数组
   * @returns 随机选择的元素
   */
  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('array cannot be empty');
    }
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }

  /**
   * 打乱数组（Fisher-Yates 洗牌算法）
   * @param array 要打乱的数组
   * @returns 打乱后的新数组
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
