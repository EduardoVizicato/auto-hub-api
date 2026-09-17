const VALID_VALUES = ['CLIENT', 'SHOP'] as const;

type RoleValue = (typeof VALID_VALUES)[number];

export class Role {
  private constructor(private readonly _value: RoleValue) {}

  static client(): Role {
    return new Role('CLIENT');
  }

  static shop(): Role {
    return new Role('SHOP');
  }

  static from(value: string): Role {
    if (!VALID_VALUES.includes(value as RoleValue)) {
      throw new Error(`Invalid Role: ${value}`);
    }
    return new Role(value as RoleValue);
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
