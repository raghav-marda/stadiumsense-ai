const { getOrCompute } = require("../lib/cache");

describe("lib/cache getOrCompute", () => {
  test("computes and returns a fresh value on first call", async () => {
    const compute = jest.fn().mockResolvedValue("first-value");
    const { value, cached } = await getOrCompute("test-key-1", compute, 60_000);

    expect(value).toBe("first-value");
    expect(cached).toBe(false);
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test("returns the cached value without recomputing within the TTL", async () => {
    const compute = jest.fn().mockResolvedValue("cached-value");

    const first = await getOrCompute("test-key-2", compute, 60_000);
    const second = await getOrCompute("test-key-2", compute, 60_000);

    expect(first.value).toBe("cached-value");
    expect(second.value).toBe("cached-value");
    expect(second.cached).toBe(true);
    // The whole point of the cache: only one real computation happened.
    expect(compute).toHaveBeenCalledTimes(1);
  });

  test("recomputes once the TTL has expired", async () => {
    const compute = jest
      .fn()
      .mockResolvedValueOnce("value-a")
      .mockResolvedValueOnce("value-b");

    const first = await getOrCompute("test-key-3", compute, 10); // 10ms TTL
    await new Promise((resolve) => setTimeout(resolve, 20));
    const second = await getOrCompute("test-key-3", compute, 10);

    expect(first.value).toBe("value-a");
    expect(second.value).toBe("value-b");
    expect(second.cached).toBe(false);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  test("different keys are cached independently", async () => {
    const computeA = jest.fn().mockResolvedValue("A");
    const computeB = jest.fn().mockResolvedValue("B");

    const a = await getOrCompute("test-key-4a", computeA, 60_000);
    const b = await getOrCompute("test-key-4b", computeB, 60_000);

    expect(a.value).toBe("A");
    expect(b.value).toBe("B");
  });
});
