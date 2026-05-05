import re
from pathlib import Path
from typing import Optional, Callable, Any
from starlette.websockets import WebSocket
from anyio import from_thread
from anyio.to_thread import run_sync
from pytubefix import Playlist, Stream
from pytubefix.__main__ import YouTube

from backend.config import DOWNLOAD_PATH


def sanitize_filename(name: str) -> str:
    """Remove characters that are invalid in filenames."""
    return re.sub(r'[<>:"/\\|?*]', "", name).strip()


async def download_video_audio(
        url: str,
        on_progress_callback: Optional[Callable[[Any, bytes, int], None]] = None
) -> Path:

    yt = YouTube(url, on_progress_callback=on_progress_callback)
    stream = yt.streams.get_audio_only()

    if stream is None:
        raise ValueError(f"No audio stream found for: {url}")

    filename = sanitize_filename(stream.title) + ".m4a"

    print("Downloading: ", yt.title)
    downloaded = await run_sync(stream.download, str(DOWNLOAD_PATH), filename)

    path = Path(downloaded)
    print(f"Saved to: {path}")
    return path


async def download_playlist_audio(url: str) -> list[Path]:
    playlist = Playlist(url)

    print(f"Playlist : {playlist.title} ({playlist.length} videos)")

    downloaded_files = []
    for index, video in enumerate(playlist.videos):
        try:
            print(f"[{index}/{playlist.length}]", end=" ")
            path = await download_video_audio(video.watch_url)
            downloaded_files.append(path)
        except Exception as e:
            print(f"    Skipped '{video.title}' ({video.watch_url}): {e}")

    print(f"\nDone — {len(downloaded_files)} file(s) saved to: {DOWNLOAD_PATH}")
    return downloaded_files


def get_video_details(url: str) -> dict[str, Any]:
    yt = YouTube(url)
    return {
        'author': yt.author,
        'title': yt.title,
        'duration': yt.length,
        'thumbnail_url': yt.thumbnail_url,
        'id': yt.video_id,
    }


def create_progress_callback(video_id: int, websocket: Websocket) -> Callable[[Any, bytes, int], None]:
    def on_progress(stream: Stream, chunk: bytes, bytes_remaining: int):
        total_size = stream.filesize
        bytes_downloaded = total_size - bytes_remaining
        percentage_of_completion = round((bytes_downloaded / total_size) * 100, 2)

        from_thread.run(websocket.send_json,{
            'type': 'progress',
            'data': {
                'value': percentage_of_completion,
                'id': video_id,
            }
        })

    return on_progress