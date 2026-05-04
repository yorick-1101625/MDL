from fastapi import FastAPI
from pytubefix import Playlist
from pydantic import BaseModel


from backend.services.downloader import download_video_audio, download_playlist_audio


class Url(BaseModel):
    url: str


app = FastAPI()

# /docs or /redoc for api documentation and testing

@app.post('/download/video')
async def download(url: Url):

    file_location = download_video_audio(url.url)

    return {"file": file_location}


@app.post('/download/playlist')
async def download(url: Url):

    downloaded_files = download_playlist_audio(url.url)

    return {"files": downloaded_files}


