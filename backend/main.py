from anyio import from_thread
from fastapi import FastAPI
from pytubefix import Stream, Playlist
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocket, WebSocketDisconnect

from backend.config import DOWNLOAD_PATH
from backend.services.downloader import download_video_audio, download_playlist_audio, get_video_details, \
    create_progress_callback


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

    try:
        url = await websocket.receive_text()

        video_details = get_video_details(url)

        on_progress = create_progress_callback(video_details['id'], websocket)

        # Send back details: title, author, thumbnail_url
        await websocket.send_json({
            'type': 'metadata',
            'data': video_details
        })

        await download_video_audio(url, on_progress)

        await websocket.send_json({
            'type': 'progress',
            'data': {
                'value': 100,
                'id': video_details['id'],
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

        await websocket.send_json({
            'type': 'playlist_length',
            'data': {
                'value': playlist.length
            }
        })

        downloaded_files = []
        for index, video in enumerate(playlist.videos):
            try:
                print(f"[{index}/{playlist.length}]", end=" ")
                # Send back details: title, author, thumbnail_url
                await websocket.send_json({
                    'type': 'metadata',
                    'data': get_video_details(video.watch_url)
                })

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

        print(f"\nDone — {len(downloaded_files)} file(s) saved to: {DOWNLOAD_PATH}")


    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        await websocket.send_json({"error": str(e)})


