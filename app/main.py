import os
import json
import random

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


@app.get("/upload", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("upload.html", {"request": request})


@app.post("/upload")
async def upload_file(files: List[UploadFile]):
    try:
        # Check if the directory exists
        directory_path = 'upload/'
        if not os.path.exists(directory_path):
            # If it doesn't exist, create it
            os.makedirs(directory_path)
            print(f"Directory '{directory_path}' created.")
        file_list = []
        for file in files:
            filename = file.filename
            print(f"Received file: {filename}")
            n = 1
            # Catch existing and reassign filename
            filename_name, file_extension = os.path.splitext(filename)
            if os.path.exists(directory_path + filename):
                print("Filename exists!")
                while os.path.exists(directory_path + filename):
                    filename = f"{filename_name}_{n}{file_extension}"
                    n += 1
            # Save the file
            with open("upload/" + filename, "wb") as f:
                f.write(file.file.read())
                file_list.append(filename)
                print(f"File saved: {filename}!")

        return {"type": "alert", "content": file_list}

    except Exception as e:
        print(e)
        return {"error": str(e)}


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