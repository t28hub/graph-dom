export class Optional<T> {
  private readonly value?: T;

  public static empty<T>(): Optional<T> {
    return new Optional<T>();
  }

  public static of<T>(value: T): Optional<T> {
    if (value === null || value === undefined) {
      throw new TypeError('Value must not be null or undefined');
    }
    return new Optional<T>(value);
  }

  public static ofNullable<T>(value: T | null | undefined): Optional<T> {
    if (value === null || value === undefined) {
      return new Optional<T>();
    }
    return new Optional<T>(value);
  }

  private constructor(value?: T) {
    this.value = value;
  }

  public get(): T {
    return this.visit<T>({
      visitValue(value: T): T {
        return value;
      },
      visitUndefined(): T {
        throw new TypeError('Value is not present');
      },
    });
  }

  public isPresent(): boolean {
    return this.value !== undefined;
  }

  public ifPresent(consumer: (value: T) => void): void {
    this.visit<void>({
      visitValue(value: T) {
        consumer(value);
      },
      visitUndefined() {
        return;
      },
    });
  }

  public map<U>(mapper: (value: T) => U): Optional<U> {
    return this.visit<Optional<U>>({
      visitValue(value: T): Optional<U> {
        return Optional.of(mapper(value));
      },
      visitUndefined(): Optional<U> {
        return Optional.empty<U>();
      },
    });
  }

  public orElse(other: T): T {
    return this.visit<T>({
      visitValue(value: T): T {
        return value;
      },
      visitUndefined(): T {
        return other;
      },
    });
  }

  public orElseGet(supplier: () => T): T {
    return this.visit<T>({
      visitValue(value: T): T {
        return value;
      },
      visitUndefined(): T {
        return supplier();
      },
    });
  }

  public orElseThrow<E extends Error>(supplier: () => E): T {
    return this.visit<T>({
      visitValue(value: T): T {
        return value;
      },
      visitUndefined(): T {
        throw supplier();
      },
    });
  }

  private visit<U>(visitor: Visitor<T, U>): U {
    return this.value !== undefined ? visitor.visitValue(this.value) : visitor.visitUndefined();
  }
}

interface Visitor<T, U> {
  visitValue(value: T): U;

  visitUndefined(): U;
}
