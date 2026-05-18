export async function parseFetchErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const text = await response.text();
  if (!text) {
    return fallback;
  }
  try {
    const body = JSON.parse(text) as { error?: string };
    if (body.error) {
      return body.error;
    }
  } catch {
    /* use raw text */
  }
  return text;
}
