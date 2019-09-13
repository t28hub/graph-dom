/*
 * Copyright 2019 Tatsuya Maki
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

  public orElse(other: T | null): T | null {
    return this.visit<T | null>({
      visitValue(value: T): T {
        return value;
      },
      visitUndefined(): T | null {
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
