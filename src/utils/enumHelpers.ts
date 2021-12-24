// This helper methos assume the enum types are not mixed or heterogenous. 
// They are either string enums, or number enums.
// partially inspired by https://www.angularjswiki.com/angular/names-of-enums-typescript/


export function getEnumKeyValuePairs(myEnum: any): any {
  const keyValuePairs = {};
  let enumKeys = getEnumKeys(myEnum);
  enumKeys.forEach( x => (keyValuePairs as any)[x] = myEnum[x]);
  return keyValuePairs;
}

export function getEnumKeyByEnumValue(myEnum: any, enumValue: number | string): string {
  let enumKeys = getEnumKeys(myEnum);
  const key = enumKeys.find(x=> myEnum[x] === enumValue);
  if(key)
    return key;
  
  throw new Error("not matching enum key-value");
};

export function getEnumValueByEnumKey(myEnum: any, enumKey: string): number | string {
  let values = getEnumValues(myEnum);
  const val = values.find(x => myEnum[enumKey] === x);
  if(val)
    return val;
  
    throw new Error("not matching enum key-value");
};

export function getEnumKeys(myEnum: any): string[] {
  let enumKeys = Object.keys(myEnum).filter(x=> isNaN(Number(x)));
  return enumKeys;
};

export function getEnumValues(myEnum: any): (number | string)[] {
  let enumKeys = getEnumKeys(myEnum);
  return enumKeys.map(x => myEnum[x]);
};
