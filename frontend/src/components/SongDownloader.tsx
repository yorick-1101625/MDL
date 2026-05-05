import {URLInput} from "@/components/URLInput.tsx";
import {ItemGroup} from "@/components/ui/item.tsx";
import Video from "./Video.tsx";
import {useRef, useState} from "react";
import VideoSkeleton from "./VideoSkeleton.tsx";
import type {TVideo} from "@/types.ts";
import {fetchPlaylistMetadata, fetchVideoMetadata} from "@/utils/youtube.ts";
import useVideos from "@/hooks/useVideos.ts";

export default function SongDownloader() {
    const urlInputRef = useRef<HTMLInputElement>(null);

    const {videos, addVideo, updateVideoProgress} = useVideos();
    const [skeletonCount, setSkeletonCount] = useState(0);

    async function handleSubmit() {

        if (!urlInputRef.current?.value) return;


        const url: string = urlInputRef.current.value;

        const urlType = url.includes('playlist') ? 'playlist' : 'video';

        let endpoint: string;

        if (urlType === 'video') {
            setSkeletonCount(s => s + 1);
            endpoint = "ws://localhost:8000/ws/download/video";

            const video: TVideo = await fetchVideoMetadata(url);

            setSkeletonCount(s => s - 1);
            addVideo(video);
        }
        else {
            endpoint = "ws://localhost:8000/ws/download/playlist";

            await fetchPlaylistMetadata(
                url,
                (length) => setSkeletonCount(length),
                (video) => {
                    addVideo(video);
                    setSkeletonCount(s => s - 1);
                }
            );
        }

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
                    Array.from({ length: skeletonCount }).map((_, i) => (
                        <VideoSkeleton key={i}/>
                    ))
                }
            </ItemGroup>
        </>
    );
}