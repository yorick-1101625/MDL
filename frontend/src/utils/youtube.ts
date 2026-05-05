import type {TVideo} from "@/types.ts";

type TVideoMetadataResponse = {
    id: string,
    title: string,
    author: string,
    thumbnail_url: string,
    url: string,
};

export async function getVideoMetadata(url: string): Promise<TVideo> {
    const data: TVideoMetadataResponse = await fetch(`http://localhost:8000/metadata/video?url=${url}`)
        .then(res => res.json());

    return {
        id: data.id,
        title: data.title,
        author: data.author,
        url: data.url,
        thumbnailUrl: data.thumbnail_url,
        progress: 0,
    };
}

export async function getPlaylistMetadata(url: string): Promise<TVideo[]> {
    const data: {
        videos: TVideoMetadataResponse[]
    } = await fetch(`http://localhost:8000/metadata/playlist?url=${url}`).then(res => res.json());

    return data.videos.map(video => ({
        id: video.id,
        title: video.title,
        author: video.author,
        url: video.url,
        thumbnailUrl: video.thumbnail_url,
        progress: 0,
    }))
}