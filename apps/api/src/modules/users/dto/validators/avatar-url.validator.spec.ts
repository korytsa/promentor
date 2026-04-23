import { describe, expect, it } from "@jest/globals";
import {
  isDeviceAvatarDataUrl,
  isValidAvatarUrl,
} from "./avatar-url.validator";

const DATA_PNG_PREFIX = "data:image/png;base64,";

const FULL_BASE64_PAYLOAD_SCAN_BYTES = 256 * 1024;

function coreBase64Body(length: number): string {
  return "A".repeat(length);
}

function dataUrlWithPayloadLength(payloadLength: number): string {
  return DATA_PNG_PREFIX + coreBase64Body(payloadLength);
}

describe("isValidAvatarUrl — http(s) image links", () => {
  it("accepts https URLs ending in .jpg", () => {
    expect(isValidAvatarUrl("https://example.com/avatar.jpg")).toBe(true);
  });

  it("accepts https URLs ending in .jpeg", () => {
    expect(isValidAvatarUrl("https://cdn.example.org/path/photo.jpeg")).toBe(
      true,
    );
  });

  it("rejects localhost image URLs", () => {
    expect(isValidAvatarUrl("http://127.0.0.1/a.jpg")).toBe(false);
  });

  it("rejects non-image paths", () => {
    expect(isValidAvatarUrl("https://example.com/page.html")).toBe(false);
  });
});

describe("isDeviceAvatarDataUrl — large payload / full scan", () => {
  it("accepts payload at exactly FULL_BASE64_PAYLOAD_SCAN_BYTES", () => {
    const url = dataUrlWithPayloadLength(FULL_BASE64_PAYLOAD_SCAN_BYTES);
    expect(isDeviceAvatarDataUrl(url)).toBe(true);
  });

  it("accepts payload one byte above the former full-scan threshold", () => {
    const url = dataUrlWithPayloadLength(FULL_BASE64_PAYLOAD_SCAN_BYTES + 1);
    expect(isDeviceAvatarDataUrl(url)).toBe(true);
  });

  it("accepts a valid data URL well above 256 KiB", () => {
    const url = dataUrlWithPayloadLength(
      FULL_BASE64_PAYLOAD_SCAN_BYTES + 64 * 1024,
    );
    expect(isDeviceAvatarDataUrl(url)).toBe(true);
  });

  it("rejects a large payload with a non-base64 character in the head chunk", () => {
    const payload = "!" + coreBase64Body(FULL_BASE64_PAYLOAD_SCAN_BYTES + 4096);
    expect(isDeviceAvatarDataUrl(DATA_PNG_PREFIX + payload)).toBe(false);
  });

  it("rejects a large payload when the tail fails strict base64 body pattern", () => {
    const len = FULL_BASE64_PAYLOAD_SCAN_BYTES + 12_000;
    const payload = coreBase64Body(len - 1) + "!";
    expect(isDeviceAvatarDataUrl(DATA_PNG_PREFIX + payload)).toBe(false);
  });

  it("rejects a large payload with a non-base64 character in the interior", () => {
    const len = FULL_BASE64_PAYLOAD_SCAN_BYTES + 20_000;
    const before = coreBase64Body(8200);
    const after = coreBase64Body(len - before.length - 1);
    const payload = `${before}!${after}`;
    expect(isDeviceAvatarDataUrl(DATA_PNG_PREFIX + payload)).toBe(false);
  });
});
