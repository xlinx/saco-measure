from ultralytics import YOLO
# Load the YOLO model
import os
from ultralytics import YOLO
import os
import tensorflow_decision_forests as tfdf
# C:\Users\x\Documents\_LANGUAGE\IdeaProjects\saco-measure\pyApp\.venv\Scripts\python.exe C:\Users\x\Documents\_LANGUAGE\IdeaProjects\saco-measure\pyApp\yolo2tf.py
#            C:\\Users\\x\\Documents\\_LANGUAGE\\IdeaProjects\\saco-measure\\pyApp\\.venv\\lib\\site-packages\\tensorflow_decision_forests\\tensorflow\\ops\\inference\\inference.so
file_path = 'C:\\Users\\x\\Documents\\_LANGUAGE\\IdeaProjects\\saco-measure\\pyApp\\.venv\\Lib\\site-packages\\tensorflow_decision_forests\\tensorflow\\ops\\inference\\inference.so'
print(os.path.isfile(file_path))  # This should return True if the file exists

if not os.path.isfile(file_path):
    raise FileNotFoundError(f"The file {file_path} does not exist.")

# Set the PATH environment variable
inference_so_dir = 'C:\\Users\\x\\Documents\\_LANGUAGE\\IdeaProjects\\saco-measure\\pyApp\\.venv\\Lib\\site-packages\\tensorflow_decision_forests\\tensorflow\\ops\\inference'
os.environ['PATH'] = inference_so_dir + os.pathsep + os.environ['PATH']

# Import tensorflow_decision_forests
try:
    import tensorflow_decision_forests as tfdf
    print("Successfully imported tensorflow_decision_forests.")
except Exception as e:
    print(f"Error importing tensorflow_decision_forests: {e}")


model = YOLO("C:\\Users\\x\\sacoMeasure\\modelAI\\best.pt")

# Export the model to TF.js format
model.export(format="tfjs")  # creates '/yolo11n_web_model'

# Load the exported TF.js model
tfjs_model = YOLO("C:\\Users\\x\\sacoMeasure\\modelAI\\best_web_model")

# pip install tensorflow==2.15.0 tensorflowjs
results = tfjs_model("https://ultralytics.com/images/bus.jpg")