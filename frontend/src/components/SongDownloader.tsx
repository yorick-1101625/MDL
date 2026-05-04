import {URLInput} from "@/components/URLInput.tsx";
import {ItemGroup} from "@/components/ui/item.tsx";
import Video from "./Video.tsx";
import {useRef, useState} from "react";

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

    async function handleSubmit() {
        const url: string = urlInputRef.current?.value || '';

        const ws = new WebSocket("ws://localhost:8000/ws/download/video");

        ws.addEventListener("open", () => {
            ws.send(url);
        });

        ws.addEventListener("message", e => {
            const res = JSON.parse(e.data);
            const data = res.data;

            switch (res.type) {
                case "metadata":
                    setVideos(v => [...v, data]);
                    break;
                case "progress":
                    setVideos(prev => prev.map(v => v.id === data.id ? {...v, progress: data.value} : v));
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
            </ItemGroup>
        </>
    );
}