import {URLInput} from "@/components/URLInput.tsx";
import {ItemGroup} from "@/components/ui/item.tsx";
import Video from "./Video.tsx";
import {useRef, useState} from "react";
import SkeletonVideo from "@/components/SkeletonVideo.tsx";

type TVideo = {
    id: string,
    title: string,
    author: string,
    duration: number,
    thumbnailUrl: string,
    progress: number,
}

export default function SongDownloader() {
    const urlInputRef = useRef<HTMLInputElement>(null);

    const [videos, setVideos] = useState<TVideo[]>([]);
    const [numberInQueue, setNumberInQueue] = useState(0);

    async function handleSubmit() {
        setNumberInQueue(1);

        const url: string = urlInputRef.current?.value || '';

        const endpoint = url.includes('playlist')
            ?   "ws://localhost:8000/ws/download/playlist"
            :   "ws://localhost:8000/ws/download/video";

        const ws = new WebSocket(endpoint);

        ws.addEventListener("open", () => {
            ws.send(url);
        });

        ws.addEventListener("message", e => {
            const res = JSON.parse(e.data);
            const data = res.data;

            switch (res.type) {
                case "length":
                    setNumberInQueue(data.value);
                    break;
                case "metadata":
                    // TODO: Check if id duplicate
                    setVideos(v => [...v, data]);
                    setNumberInQueue(prev => prev - 1);
                    break;
                case "progress":
                    setVideos(prev => prev.map(v => v.id === data.id ? {...v, progress: data.value} : v));
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
                    Array(numberInQueue).fill(null).map(value => (
                        <SkeletonVideo key={value}/>
                    ))
                }
            </ItemGroup>
        </>
    );
}