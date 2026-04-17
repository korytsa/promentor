import { ValidateBy, type ValidationOptions } from "class-validator";

const MAX_AVATAR_VALUE_LENGTH = 5_000_000;

const DATA_IMAGE_PREFIX = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i;

function isDataImageBase64(value: string): boolean {
  const m = DATA_IMAGE_PREFIX.exec(value);
  if (!m || m.index !== 0) {
    return false;
  }
  const payload = value.slice(m[0].length).replace(/\s/g, "");
  if (payload.length === 0) {
    return false;
  }
  return /^[A-Za-z0-9+/]+=*$/.test(payload);
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
