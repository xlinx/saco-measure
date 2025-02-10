from ultralytics import YOLO

# Load the YOLO11 model
model = YOLO("best.pt")

# Export the model to TF.js format
model.export(format="tfjs")  # creates '/yolo11n_web_model'

# Load the exported TF.js model
tfjs_model = YOLO("./yolo11n_web_model")

# Run inference
results = tfjs_model("https://ultralytics.com/images/bus.jpg")