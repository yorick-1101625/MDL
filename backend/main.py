import asyncio
from asyncio import to_thread

from anyio import from_thread
from anyio.to_thread import run_sync
from fastapi import FastAPI
from pytubefix import Playlist, Stream, YouTube
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocket, WebSocketDisconnect

from backend.services.downloader import download_video_audio, download_playlist_audio


class Url(BaseModel):
    url: str


app = FastAPI()
# /docs or /redoc for api documentation and testing


origins = [
    "http://localhost:5173",
    # "https://your-production-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.post('/download/video')
# async def download(url: Url):
#
#     file_location = download_video_audio(url.url)
#
#     return {"file": file_location}


@app.websocket('/ws/download/video')
async def ws_download_video(websocket: WebSocket):
    await websocket.accept()

    # on_progress callback
    def on_progress(stream: Stream, chunk: bytes, bytes_remaining: int):
        total_size = stream.filesize
        bytes_downloaded = total_size - bytes_remaining
        percentage_of_completion = round((bytes_downloaded / total_size) * 100, 2)

        from_thread.run(websocket.send_json,({"progress": percentage_of_completion}))

    try:
        url = await websocket.receive_text()
        print("url: ", url)

        await download_video_audio(url, on_progress)

        await websocket.send_json({"status": "success"})

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})


@app.post('/download/playlist')
async def download(url: Url):

    downloaded_files = download_playlist_audio(url.url)

    return {"files": downloaded_files}


# @app.websocket('/ws')
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#
#     try:
#         data = await websocket.receive_text()
#         await websocket.send_text(f"Message: {data}")
#     except WebSocketDisconnect:
#         print("Client disconnected")
#     except Exception as e:
#         await websocket.send_json({"error": str(e)})

