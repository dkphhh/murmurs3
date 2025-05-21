import { readMurmurs } from '$lib/server/db/utils.ts';

export async function GET() {
    const allMurmurs = await readMurmurs(1, 20);

    const murmursContent = allMurmurs.map((murmur) => {
        return `
<item>
<title>Dkphhh's Murmurs @${murmur.murmur.createdAt.toLocaleString()}</title>
<link>https://dkphhh.me/murmur/${murmur.murmur.uid}</link>
<description>
${murmur.murmur.content}
</description>
<author>dkphhh@foxmail.com</author>
<guid isPermaLink="true">${murmur.murmur.uid}</guid>
<pubDate>${murmur.murmur.createdAt.toUTCString()}</pubDate>
</item>
        `
    }).join('');



    return new Response(
        `
    <rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" version="2.0">
<channel>
<title>Dkphhh's Murmurs / Dkphhh 的呓语</title>
<atom:link href="blog_link" rel="self" type="application/rss+xml" />
<link>https://dkphhh.me</link>
<description>Dkphhh's Murmurs // Dkphhh 的呓语</description>
<language>zh-CN</language>
<managingEditor>dkphhh@foxmail.com</managingEditor>
<pubDate>${new Date().toUTCString()}</pubDate>
${murmursContent}
</channel>
</rss>`.trim(),
        {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}