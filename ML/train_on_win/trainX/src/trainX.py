from ultralytics import YOLO
import torch,os

print("CUDA Available:", torch.cuda.is_available())
print("GPU Count:", torch.cuda.device_count())
print("Current GPU:", torch.cuda.get_device_name(0))

model = YOLO("yolo11l-seg.pt")
results = model.train(data=".\\sacoMeasure.v5i.yolov11\\data.yaml", epochs=100, imgsz=640,device=0)
results = model("path/to/bus.jpg")

#"H:\pinokio\api\stable-diffusion-webui-forge.git\app\venv\Scripts\activate"
#yolo train model=yolo11l-seg.pt data=".\\sacoMeasure.v5i.yolov11\\data.yaml" epochs=100 imgsz=640
#yolo train 'https://hub.ultralytics.com/models/WB6PkA4M4L6kiYrUFnLC'

# H:/pinokio/api/stable-diffusion-webui-forge.git/app/venv/Scripts/python.exe C:\Users\x\Documents\_LANGUAGE\IdeaProjects\saco-measure\ML\JupyterX\trainYolo\ultraltics.py