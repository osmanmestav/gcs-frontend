export function convertEnumToArray(e: any): { [key: string]: Object }[] {
    const enumObjectList = Object.values(e) as string[];
    const enumTexts = enumObjectList.filter((_v: string, i: number) => i < enumObjectList.length / 2) as string[];
    const enumValues = enumObjectList.filter((_v: string, i: number) => i >= enumObjectList.length / 2) as string[];
    const array = enumTexts.map((p: string, i: number) => {
      return { value: enumValues[i], text: p.toString() };
    });
    return array;
  };

  export function getEnumKeyByEnumValue(myEnum: any, enumValue: number | string): string {
    let keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
    return keys.length > 0 ? keys[0] : '';
  };

  export function getEnumKeys(e: any): string[] {
    const enumObjectList = Object.values(e) as string[];
    const enumTexts = enumObjectList.filter((_v: string, i: number) => i < enumObjectList.length / 2) as string[];
    return enumTexts;
  };

  export function getEnumValues(e: any): string[] {
    const enumObjectList = Object.values(e) as string[];
    const enumValues = enumObjectList.filter((_v: string, i: number) => i >= enumObjectList.length / 2) as string[];
    return enumValues;
  };
