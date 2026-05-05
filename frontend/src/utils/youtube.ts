import type {TVideo} from "@/types.ts";

type TVideoMetadataResponse = {
    id: string,
    title: string,
    author: string,
    thumbnail_url: string,
    duration: number,
    url: string,
};


function responseToVideo(res: TVideoMetadataResponse): TVideo {
    return {
        id: res.id,
        title: res.title,
        author: res.author,
        url: res.url,
        thumbnailUrl: res.thumbnail_url,
        duration: res.duration,
        progress: 0,
    };
}


export async function fetchVideoMetadata(url: string): Promise<TVideo> {
    const data: TVideoMetadataResponse =
        await fetch(`http://localhost:8000/metadata/video?url=${encodeURIComponent(url)}`)
        .then(res => res.json());

    return responseToVideo(data);
}

export async function fetchPlaylistMetadata(
    url: string,
    onLength: (length: number) => void,
    onVideo: (video: TVideo) => void,
) {
    const res =
        await fetch(`http://localhost:8000/metadata/playlist?url=${encodeURIComponent(url)}`)

    if (!res.body) throw new Error("No response body");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? "";

        for (const line of lines) {
            if (!line.trim()) continue;

            const data = JSON.parse(line);
            if ("length" in data) {
                onLength(data.length);
            }
            else {
                onVideo( responseToVideo(data as TVideoMetadataResponse) );
            }
        }
    }
}
