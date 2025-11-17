import cv2
import time
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pyngrok import ngrok

# --------------------------
# Ngrok
# --------------------------
ngrok.set_auth_token("35Ed3pUzlE7bPZd2SyXPqTvOC6N_6JR3ZU3yhpDXu3mvQyoub")
public_url = ngrok.connect(8000)
print("Ngrok URL:", public_url)

# --------------------------
# Camera config
# --------------------------
CAMERA_URL = "http://192.168.1.57:8080/video"  # 1 camera thật
NUM_CAMERAS = 8
lst_camera_urls = [CAMERA_URL for _ in range(NUM_CAMERAS)]
camera_id_lst = [i+1 for i in range(NUM_CAMERAS)]

# --------------------------
# FastAPI app
# --------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Connect to camera thật
# --------------------------
def connect_and_stream(camera_url):
    cap = cv2.VideoCapture(camera_url)
    if not cap.isOpened():
        yield (False, None)
        return
    while True:
        ret, frame = cap.read()
        yield (ret, frame)
        if not ret:
            time.sleep(0.1)

# --------------------------
# Generator frame với duplicate cho demo
# --------------------------
def generate_frames(camera_id):
    """
    Chỉ 1 camera thật, các camera khác duplicate frame
    """
    # Camera thật là camera_id = 1 (index 0)
    real_cam_index = 0
    real_cam_url = lst_camera_urls[real_cam_index]
    cam_gen = connect_and_stream(real_cam_url)

    for ret, frame in cam_gen:
        if not ret:
            continue
        # Encode JPEG
        ret2, buffer = cv2.imencode(".jpg", frame)
        frame_bytes = buffer.tobytes()

        # Nếu camera_id >1, vẫn gửi frame từ camera thật (duplicate)
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
        )

# --------------------------
# Endpoint cho frontend
# --------------------------
@app.get("/video_feed/{camera_id}")
def video_feed(camera_id: int):
    if camera_id < 1 or camera_id > NUM_CAMERAS:
        return {"error": "camera_id invalid"}
    return StreamingResponse(
        generate_frames(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# --------------------------
# Run server
# --------------------------
if __name__ == "__main__":
    import uvicorn
    print("🚀 Server running at http://127.0.0.1:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)