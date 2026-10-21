/** Resolves a file in public/ against the app's base path, so the site also works from a sub-folder. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`
