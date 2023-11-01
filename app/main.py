import json

import uvicorn

from fastapi import FastAPI, Request, WebSocket, File, UploadFile
from fastapi.responses import HTMLResponse

from starlette.staticfiles import StaticFiles
from starlette.templating import Jinja2Templates
from starlette.websockets import WebSocketDisconnect

from typing import List


app = FastAPI(title='FrontEnd')

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/fire", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("fire.html", {"request": request})


@app.get("/upload", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})


@app.post("/upload")
async def upload_file(files: List[UploadFile]):
    try:
        # Debugging: Log received files
        for file in files:
            print(f"Received file: {file.filename}")

            with open("upload/" + file.filename, "wb") as f:
                f.write(file.file.read())
        return {"filename": file.filename}

    except Exception as e:
        return {"error": str(e)}


@app.get("/fileupload", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("fileupload.html", {"request": request})


@app.get("/tail", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("tail.html", {"request": request})


# Websocket endpoint
@app.websocket("/websocket")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # await for messages and send messages
        while True:
            last_data = await websocket.receive_text()

            print(last_data)

            mes_object = {"type": "system", "content": "hello"}

            await websocket.send_text(json.dumps(mes_object))

    except WebSocketDisconnect:
        manager.disconnect(websocket)


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        json_data = json.dumps({"type": "text", "content": "Welcome!"})
        await self.broadcast(json_data)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except WebSocketDisconnect:
                self.disconnect(connection)


manager = ConnectionManager()


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)