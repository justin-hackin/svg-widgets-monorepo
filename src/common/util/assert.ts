export function assertNotNullish<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error(`Expected non-nullish value, got ${String(value)}`);
  }
}
