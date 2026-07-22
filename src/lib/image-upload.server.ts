import "server-only";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function validateImageFile(
  image: FormDataEntryValue | null,
  options: { required?: boolean } = {},
) {
  if (!(image instanceof File) || image.size === 0) {
    return options.required ? "画像を選択してください。" : null;
  }
  if (image.size > MAX_IMAGE_BYTES)
    return "画像は5MB以下のファイルをアップロードしてください。";
  if (!ALLOWED_IMAGE_TYPES.includes(image.type))
    return "JPG、PNG、WebP形式の画像のみアップロードできます。";
  return null;
}
