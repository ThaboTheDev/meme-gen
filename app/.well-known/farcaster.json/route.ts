function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

return Response.json({
  accountAssociation: {
    header: "eyJmaWQiOjEzMjY0NjUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhiNTQ3ODFBN2U5MDk0ZUYyYzM1NTg0OTEyZUYxRURFQzllMDdDMWIwIn0",
    payload: "eyJkb21haW4iOiJtZW1lLWdlbi1vbWVnYS52ZXJjZWwuYXBwIn0",
    signature: "MHg2NWE2NjNmZGExZGUyNGNjMmZhN2QzOWI1ZTI2NTU3MzU1NjEwMTE5MWFmMWFjYjUxZGRhN2FiZmZmNGY3MTBhNmEwNTk5YjQ1MDRkNzU3YzA0NWViNTAzNTQ4Yjk5OWEzZjUxNGUwMTBkNTkyMGM3MjFhMTk5NzhmYWJlMTAzNDFj"
  },
  frame: withValidProperties({
    version: "1",
    name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    screenshotUrls: [],
    iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
    splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
    splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
    homeUrl: URL,
    webhookUrl: `${URL}/api/webhook`,
    primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
    tags: [],
    heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
    tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
    ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
    ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
    ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
  }),
});
}
