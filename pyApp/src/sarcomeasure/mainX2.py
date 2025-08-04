import threading
from pathlib import Path
from ultralytics import YOLO
import cv2
import os

# Configuration
home = Path.home().joinpath('sarcoMeasure')
home_model = home.joinpath('modelAI')
home_input = home.joinpath('input')

# Output directory for results
IMAGE_DIR_OUTPUT = home.joinpath('output')  # Save predictions here

DECADE_MODEL = 'yellow.v10.pt'
IMAGE_DIR = '/Users/x/sarcoMeasure/input'  # Input image directory

# Global variables
activeCount = 0
loopCount = 0
yolo_model = None

# Define class-specific confidence thresholds (customize as needed)
CONFIDENCE_THRESHOLDS = {
    "redSpace": 0.1,       # Confidence threshold for redSpace
    "cell": 0.85,          # Confidence threshold for cell
    "nucleus": 0.9,        # Confidence threshold for nucleus
    "other": 0.7           # Default confidence for other classes
}
def thread_safe_predict(_yolo_model, image_path):
    """
    Perform YOLO prediction on the given image or directory and save results to IMAGE_DIR_OUTPUT.
    Filters detections based on class-specific confidence thresholds.
    """
    global activeCount
    try:
        # Ensure input path exists
        if not os.path.exists(image_path):
            print(f"[ERROR] Path does not exist: {image_path}")
            return

        # Create output directory if it doesn't exist
        if not IMAGE_DIR_OUTPUT.exists():
            IMAGE_DIR_OUTPUT.mkdir(parents=True, exist_ok=True)

        # Run YOLO prediction with default confidence (e.g., 0.5)
        results = _yolo_model.predict(
            source=image_path,
            save=True,
            save_dir=str(IMAGE_DIR_OUTPUT),
            conf=0.001  # Default confidence threshold
        )

        # Filter detections based on class and confidence
        filtered_results = []
        for result in results:
            filtered_boxes = []
            for box in result.boxes:
                class_id = int(box.cls)
                class_name = _yolo_model.names[class_id]
                conf = float(box.conf)

                # Get the confidence threshold for this class
                threshold = CONFIDENCE_THRESHOLDS.get(class_name, CONFIDENCE_THRESHOLDS["other"])

                # Apply filtering based on class-specific confidence
                if conf >= threshold:
                    filtered_boxes.append(box)
            # Create a new result with only the filtered boxes
            if filtered_boxes:
                filtered_result = type(result)(
                    orig_img=result.orig_img,
                    boxes=filtered_boxes,
                    masks=result.masks,
                    probs=result.probs,
                    keypoints=result.keypoints,
                    obb=result.obb,
                    path=result.path,
                    names=result.names
                )
                filtered_results.append(filtered_result)

        # Save or visualize the filtered results without captions
        # Ensure output directory exists
        if not IMAGE_DIR_OUTPUT.exists():
            IMAGE_DIR_OUTPUT.mkdir(parents=True, exist_ok=True)

        for result2 in filtered_results:
            annotated_img = result2.plot(show_conf=False)  # No labels or confidence
            output_path = IMAGE_DIR_OUTPUT.joinpath(result2.path.name)

            try:
                cv2.imwrite(str(output_path), annotated_img)
                print(f"[INFO] Saved image to: {output_path}")
            except Exception as e:
                print(f"[ERROR] Failed to save image at {output_path}: {str(e)}")

        activeCount += 1
        print(f"[INFO] Predictions saved to {IMAGE_DIR_OUTPUT}")

    except Exception as e:
        print(f"[ERROR] Failed to process {image_path}: {str(e)}")

def main():
    """
    Main function to initialize the YOLO model and start prediction thread.
    """
    global yolo_model
    print("[][][__init__] Hello from pyapp!")

    # Ensure output directory exists
    if not IMAGE_DIR_OUTPUT.exists():
        IMAGE_DIR_OUTPUT.mkdir(parents=True, exist_ok=True)

    # Load YOLO model
    model_path = home_model.joinpath(DECADE_MODEL)
    if not model_path.exists():
        print(f"[ERROR] Model file not found: {model_path}")
        return

    try:
        yolo_model = YOLO(model=model_path)
        print(f"[INFO] Model loaded from {model_path}")

        # Start a thread to process the input directory
        threadX = threading.Thread(target=thread_safe_predict, args=(yolo_model, IMAGE_DIR))
        threadX.start()
        threadX.join()

    except Exception as e:
        print(f"[ERROR] Failed to initialize model: {str(e)}")

if __name__ == "__main__":
    main()
