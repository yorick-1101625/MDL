import {URLInput} from "@/components/URLInput.tsx";
import {ItemGroup} from "@/components/ui/item.tsx";
import Video from "./Video.tsx";
import {useRef, useState} from "react";
import SkeletonVideo from "@/components/SkeletonVideo.tsx";
import type {TVideo} from "@/types.ts";
import {getPlaylistMetadata, getVideoMetadata} from "@/utils/youtube.ts";
import useVideos from "@/hooks/useVideos.ts";

export default function SongDownloader() {
    const urlInputRef = useRef<HTMLInputElement>(null);

    const {videos, addVideo, updateVideoProgress} = useVideos();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit() {
        setIsLoading(true);

        if (!urlInputRef.current?.value) return;


        const url: string = urlInputRef.current.value;

        const urlType = url.includes('playlist') ? 'playlist' : 'video';

        let endpoint: string;

        if (urlType === 'video') {
            endpoint = "ws://localhost:8000/ws/download/video";


            const video: TVideo = await getVideoMetadata(url);

            addVideo(video);
        }
        else {
            endpoint = "ws://localhost:8000/ws/download/playlist";


            const videos: TVideo[] = await getPlaylistMetadata(url);
            videos.forEach(video => addVideo(video));
        }

        setIsLoading(false);

        const ws = new WebSocket(endpoint);

        ws.addEventListener("open", () => {
            ws.send(url);
        });

        ws.addEventListener("message", e => {
            const res = JSON.parse(e.data);
            const data = res.data;

            switch (res.type) {
                case "progress":
                    updateVideoProgress(data.id, data.value);
                    break;
                default:
                    break;
            }
        });
    }

    return (
        <>
            <URLInput ref={urlInputRef} onSubmit={handleSubmit}/>
            <ItemGroup>
                {
                    videos.map(video => (
                        <Video key={video.id} {...video}/>
                    ))
                }

                {
                    isLoading && <SkeletonVideo/>
                }
            </ItemGroup>
        </>
    );
}