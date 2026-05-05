import {useState} from "react";
import type {TVideo} from "@/types.ts";

export default function useVideos() {
    const [videos, setVideos] = useState<TVideo[]>([]);

    function addVideo(newVideo: TVideo): void {
        setVideos(v => [...v.filter(video => video.id !== newVideo.id), newVideo])
    }

    function updateVideoProgress(videoId: string, progress: number) {
        setVideos(prev => prev.map(v => v.id === videoId ? {...v, progress: progress} : v));
    }

    return {videos, addVideo, updateVideoProgress};
}