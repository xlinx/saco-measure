from ultralytics import YOLO

# Load the YOLO model
model = YOLO("/Users/xlinx/sacoMeasure/modelAI/best.pt")

# Export the model to TensorFlow.js format
model.export(format="tfjs")