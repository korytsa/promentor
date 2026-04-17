import { ValidateBy, type ValidationOptions } from "class-validator";

export const MAX_AVATAR_VALUE_LENGTH = 5_000_000;

const DATA_IMAGE_PREFIX = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i;

const FULL_BASE64_PAYLOAD_SCAN_BYTES = 256 * 1024;

const LARGE_PAYLOAD_SAMPLE_CHUNK = 8192;
const LARGE_PAYLOAD_INTERIOR_SLICES = 8;
const LARGE_PAYLOAD_INTERIOR_SLICE_LEN = 512;

const BASE64_BODY = /^[A-Za-z0-9+/]+=*$/;

function isBase64BodyChar(code: number): boolean {
  return (
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    code === 43 ||
    code === 47
  );
}

function segmentIsCoreBase64(
  payload: string,
  start: number,
  end: number,
): boolean {
  for (let i = start; i < end; i++) {
    if (!isBase64BodyChar(payload.charCodeAt(i))) {
      return false;
    }
  }
  return true;
}

function largePayloadLooksLikeBase64(payload: string): boolean {
  const n = payload.length;
  const headLen = Math.min(LARGE_PAYLOAD_SAMPLE_CHUNK, n);
  if (!segmentIsCoreBase64(payload, 0, headLen)) {
    return false;
  }

  const tailStart = Math.max(0, n - LARGE_PAYLOAD_SAMPLE_CHUNK);
  if (!BASE64_BODY.test(payload.slice(tailStart))) {
    return false;
  }

  const interiorEnd = tailStart;
  const interiorSpan = interiorEnd - headLen;
  if (interiorSpan <= LARGE_PAYLOAD_INTERIOR_SLICE_LEN) {
    return true;
  }

  const step = Math.max(
    1,
    Math.floor(interiorSpan / (LARGE_PAYLOAD_INTERIOR_SLICES + 1)),
  );
  for (
    let pos = headLen;
    pos < interiorEnd - LARGE_PAYLOAD_INTERIOR_SLICE_LEN;
    pos += step
  ) {
    const sliceEnd = pos + LARGE_PAYLOAD_INTERIOR_SLICE_LEN;
    if (!segmentIsCoreBase64(payload, pos, sliceEnd)) {
      return false;
    }
  }

  return true;
}

function isDataImageBase64(value: string): boolean {
  const m = DATA_IMAGE_PREFIX.exec(value);
  if (!m || m.index !== 0) {
    return false;
  }
  const payload = value.slice(m[0].length).replace(/\s/g, "");
  if (payload.length === 0) {
    return false;
  }
  if (payload.length <= FULL_BASE64_PAYLOAD_SCAN_BYTES) {
    return BASE64_BODY.test(payload);
  }
  return largePayloadLooksLikeBase64(payload);
}

export function isDeviceAvatarDataUrl(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  if (value.length > MAX_AVATAR_VALUE_LENGTH) {
    return false;
  }
  return isDataImageBase64(value);
}

export function IsDeviceAvatarDataUrl(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: "isDeviceAvatarDataUrl",
      constraints: [],
      validator: {
        validate: (v: unknown): boolean => isDeviceAvatarDataUrl(v),
        defaultMessage: () =>
          "avatarUrl must be a PNG, JPEG, GIF, or WebP data URL from an uploaded image",
      },
    },
    validationOptions,
  );
}
