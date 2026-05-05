from fastapi import FastAPI
from pytubefix import Playlist, YouTube
from starlette.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocket, WebSocketDisconnect

from backend.config import DOWNLOAD_PATH
from backend.services.downloader import download_video_audio, get_video_metadata, \
    create_progress_callback

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


@app.get('/metadata/video')
def get_metadata_video(url):
    video = YouTube(url)

    return get_video_metadata(video)


@app.get('/metadata/playlist')
def get_metadata_playlist(url):
    playlist = Playlist(url)

    return {
        'videos': [get_video_metadata(video) for video in playlist.videos],
    }


@app.websocket('/ws/download/video')
async def ws_download_video(websocket: WebSocket):
    await websocket.accept()

    try:
        url = await websocket.receive_text()

        yt = YouTube(url)
        metadata = get_video_metadata(yt)

        on_progress = create_progress_callback(metadata['id'], websocket)
        await download_video_audio(url, on_progress)

        await websocket.send_json({
            'type': 'progress',
            'data': {
                'value': 100,
                'id': metadata['id'],
            }
        })

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})


@app.websocket('/ws/download/playlist')
async def download(websocket: WebSocket):
    await websocket.accept()

    try:
        url = await websocket.receive_text()

        playlist = Playlist(url)
        print(f"Playlist : {playlist.title} ({playlist.length} videos)")

        # Start download
        downloaded_files = []
        for index, video in enumerate(playlist.videos):
            try:
                print(f"[{index + 1}/{playlist.length}]")

                on_progress = create_progress_callback(video.video_id, websocket)
                path = await download_video_audio(video.watch_url, on_progress)

                await websocket.send_json({
                    'type': 'progress',
                    'data': {
                        'value': 100,
                        'id': video.video_id,
                    }
                })

                downloaded_files.append(path)
            except Exception as e:
                print(f"    Skipped '{video.title}' ({video.watch_url}): {e}")
                # TODO: send error through websocket

        print(f"\nDone — {len(downloaded_files)} file(s) saved to: {DOWNLOAD_PATH}")


    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})


