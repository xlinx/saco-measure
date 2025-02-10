from ultralytics import YOLO, checks, hub
checks()

hub.login('3222aa9cf179e50755f833509c758304dddb8a575f')

model = YOLO('https://hub.ultralytics.com/models/WB6PkA4M4L6kiYrUFnLC')
results = model.train()