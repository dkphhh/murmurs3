import { readAllMurmurs } from '$lib/server/db/utils.ts';


export async function GET() {
    const allMurmurs = await readAllMurmurs();

    const urls = allMurmurs.map((murmur) => {
        return `
        <url>
        <loc>https://dkphhh.me/murmur/${murmur.murmur.uid}</loc>
        <lastmod>${murmur.murmur.updatedAt.toISOString()}</lastmod>
        </url>`
    }).join("");



    return new Response(
        `
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			${urls}
		</urlset>`.trim(),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}