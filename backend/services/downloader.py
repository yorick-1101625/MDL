import re
from pathlib import Path

from pytubefix import Playlist
from pytubefix.__main__ import YouTube
from pytubefix.cli import on_progress

from backend.config import DOWNLOAD_PATH


def sanitize_filename(name: str) -> str:
    """Remove characters that are invalid in filenames."""
    return re.sub(r'[<>:"/\\|?*]', "", name).strip()


def download_video_audio(url: str) -> Path:

    yt = YouTube(url, on_progress_callback=on_progress)
    stream = yt.streams.get_audio_only()

    if stream is None:
        raise ValueError(f"No audio stream found for: {url}")

    filename = sanitize_filename(stream.title) + ".m4a"

    print("Downloading: ", yt.title)
    downloaded = stream.download(output_path=str(DOWNLOAD_PATH), filename=filename)

    path = Path(downloaded)
    print(f"Saved to: {path}")
    return path


def download_playlist_audio(url: str) -> list[Path]:
    playlist = Playlist(url)

    print(f"Playlist : {playlist.title} ({playlist.length} videos)")

    downloaded_files = []
    for index, video in enumerate(playlist.videos):
        try:
            print(f"[{index}/{playlist.length}]", end=" ")
            path = download_video_audio(video.watch_url)
            downloaded_files.append(path)
        except Exception as e:
            print(f"    Skipped '{video.title}' ({video.watch_url}): {e}")

    print(f"\nDone — {len(downloaded_files)} file(s) saved to: {DOWNLOAD_PATH}")
    return downloaded_files



def get_details(yt: YouTube):
    print("author: ", yt.author)
    print("title: ", yt.title)
    print("thumbnail_url: ", yt.thumbnail_url)
