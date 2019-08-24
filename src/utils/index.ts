export const requireNotNull = <T>(arg: T | null, name: string = 'arg'): T => {
  if (arg == null) {
    throw new TypeError(`${name} must not be null`);
  }
  return arg!;
};
