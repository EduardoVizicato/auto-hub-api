const VALID_VALUES = ['CLIENT', 'SHOP'] as const;

type RaterTypeValue = (typeof VALID_VALUES)[number];

export class RaterType {
  private constructor(private readonly _value: RaterTypeValue) {}

  static client(): RaterType {
    return new RaterType('CLIENT');
  }

  static shop(): RaterType {
    return new RaterType('SHOP');
  }

  static from(value: string): RaterType {
    if (!VALID_VALUES.includes(value as RaterTypeValue)) {
      throw new Error(`Invalid RaterType: ${value}`);
    }
    return new RaterType(value as RaterTypeValue);
  }

  get value(): string {
    return this._value;
  }

  isClient(): boolean {
    return this._value === 'CLIENT';
  }

  isShop(): boolean {
    return this._value === 'SHOP';
  }
}
