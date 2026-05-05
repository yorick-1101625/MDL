import {URLInput} from "@/components/URLInput.tsx";
import {ItemGroup} from "@/components/ui/item.tsx";
import Video from "./Video.tsx";
import {useRef, useState} from "react";
import SkeletonVideo from "@/components/SkeletonVideo.tsx";
import type {TVideo} from "@/types.ts";
import {getVideoMetadata} from "@/utils/youtube.ts";
import useVideos from "@/hooks/useVideos.ts";

export default function SongDownloader() {
    const urlInputRef = useRef<HTMLInputElement>(null);

    const {videos, addVideo, updateVideoProgress} = useVideos();
    const [numberInQueue, setNumberInQueue] = useState(0);

    async function handleSubmit() {
        if (!urlInputRef.current?.value) return;

        setNumberInQueue(1);

        const url: string = urlInputRef.current.value;

        const urlType = url.includes('playlist') ? 'playlist' : 'video';

        let endpoint: string;

        if (urlType === 'video') {
            endpoint = "ws://localhost:8000/ws/download/video";
            const video: TVideo = await getVideoMetadata(url);
            setNumberInQueue(n => n - 1);
            addVideo(video);
        }
        else {
            endpoint = "ws://localhost:8000/ws/download/playlist";
        }

        const ws = new WebSocket(endpoint);

        ws.addEventListener("open", () => {
            ws.send(url);
        });

        ws.addEventListener("message", e => {
            const res = JSON.parse(e.data);
            const data = res.data;

            switch (res.type) {
                case "playlist_length":
                    setNumberInQueue(data.value);
                    break;
                case "metadata":
                    addVideo(data);
                    setNumberInQueue(prev => prev - 1);
                    break;
                case "progress":
                    updateVideoProgress(data.id, data.value);
                    break;
                default:
                    break;
            }
        });

        ws.addEventListener("close", () => {
            setNumberInQueue(0);
        })
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
                    numberInQueue > 0 && Array(numberInQueue).fill(null).map(value => (
                        <SkeletonVideo key={value}/>
                    ))
                }
                <SkeletonVideo/>
            </ItemGroup>
        </>
    );
}