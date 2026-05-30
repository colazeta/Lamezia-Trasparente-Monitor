import { describe, it, expect } from "vitest";

import { resolvePostImageSrc } from "./postImages";

describe("resolvePostImageSrc", () => {
  it("rewrites a raw object path to the storage-serving route", () => {
    expect(resolvePostImageSrc("/objects/uploads/abc-123")).toBe(
      "/api/storage/objects/uploads/abc-123",
    );
  });

  it("accepts an already-served private storage path unchanged", () => {
    const src = "/api/storage/objects/uploads/abc-123";
    expect(resolvePostImageSrc(src)).toBe(src);
  });

  it("accepts an already-served public storage path unchanged", () => {
    const src = "/api/storage/public-objects/banner.jpg";
    expect(resolvePostImageSrc(src)).toBe(src);
  });

  it("returns null for an empty or undefined source", () => {
    expect(resolvePostImageSrc(undefined)).toBeNull();
    expect(resolvePostImageSrc("")).toBeNull();
  });

  it("rejects arbitrary external URLs", () => {
    expect(resolvePostImageSrc("https://evil.example.com/x.jpg")).toBeNull();
    expect(resolvePostImageSrc("http://example.com/pic.png")).toBeNull();
  });

  it("rejects dangerous and non-storage schemes/paths", () => {
    expect(resolvePostImageSrc("javascript:alert(1)")).toBeNull();
    expect(resolvePostImageSrc("data:image/png;base64,AAAA")).toBeNull();
    expect(resolvePostImageSrc("/api/storage/other/thing")).toBeNull();
    expect(resolvePostImageSrc("/uploads/abc-123")).toBeNull();
  });
});
