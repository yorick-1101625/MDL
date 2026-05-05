import type {TVideo} from "@/types.ts";

export async function getVideoMetadata(url: string): Promise<TVideo> {
    const data = await fetch(`https://youtube.com/oembed?url=${url}&format=json`)
        .then(res => res.json());

    const id: string = data.thumbnail_url.split('/')[4];

    return {
        id: id,
        title: data.title,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
        progress: 0.
    };
}
