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
