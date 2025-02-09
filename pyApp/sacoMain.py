
import os
import time
from pathlib import Path
import datetime
import glob
from threading import Thread
import cv2
import numpy as np

from ultralytics import YOLO
# from shapely.geometry import Polygon


DECADE_MODEL='best_y11Lseg.pt'
# yolo_model = YOLO('car_plate.pt')
# yolo_model = YOLO('best.pt')
yolo_model = YOLO(DECADE_MODEL)

extension = '.jpg'

att_dir_input = 'input'
att_dir_processed = 'processed'
att_dir_output = 'output'

att_dir_input_Path = Path(att_dir_input)
att_dir_processed_Path= Path(att_dir_processed)
att_dir_output_Path= Path(att_dir_output)

if not os.path.exists(att_dir_processed):
    os.makedirs(att_dir_processed)
if not os.path.exists(att_dir_input):
    os.makedirs(att_dir_input)
if not os.path.exists(att_dir_output):
    os.makedirs(att_dir_output)
# shutil.move(att_dir_input+os.sep+'*', att_dir_output)

for each_file in att_dir_input_Path.glob('*.*'): # grabs all files
     # gets the parent of the folder
    each_file.rename(att_dir_output_Path.joinpath(each_file.name)) # moves to parent folder.
def directory_modified(dir_path, poll_timeout=1):
    init_mtime = os.stat(dir_path).st_mtime
    while True:
        now_mtime = os.stat(dir_path).st_mtime
        if init_mtime != now_mtime:
            init_mtime = now_mtime
            print(datetime.datetime.now(),"[1][decade.tw][monitor][different]input=",att_dir_input,", output=",att_dir_output)
            allImages = []
            for ext in ('*.gif', '*.png', '*.jpg','*.tif'):
                allImages.extend(glob.glob(att_dir_input+os.sep+ ext))
            # allImages=glob.glob(att_dir_input+os.sep+'*.jpg')
            print(datetime.datetime.now(), "[2][decade.tw][monitor][different]allImages=", allImages)
            # yolo_decade(None,None,allImages)
            for imagePathX in allImages:
                # step1_rawImageX=cv2.imread(imagePathX)
                yolo_decade(None,imagePathX)
                # os.remove(imagePathX)
        else:
            print(datetime.datetime.now(),"[3][decade.tw][monitor][same]input=",att_dir_input)
        time.sleep(poll_timeout)

def thread_safe_predict(yolo_model, image_path):
    """Performs thread-safe prediction on an image using a locally instantiated YOLO model."""
    yolo_results = yolo_model.predict(image_path,classes=[0],conf=0.5)
    for result in yolo_results:
        boxes = result.boxes  # Boxes object for bounding box outputs
        masks = result.masks  # Masks object for segmentation masks outputs
        keypoints = result.keypoints  # Keypoints object for pose outputs
        probs = result.probs  # Probs object for classification outputs
        obb = result.obb  # Oriented boxes object for OBB outputs
        # result.show()  # display to screen
        result.save(filename=att_dir_processed_Path.joinpath('result_' + Path(image_path).name))
        Path(image_path).rename(att_dir_processed_Path.joinpath(Path(image_path).name))

        for index in range(len(masks)):
            img = np.copy(result.orig_img)
            b_mask = np.zeros(img.shape[:2], np.uint8)
            contour = masks[index].xy[0].astype(np.int32).reshape(-1, 1, 2)
            cv2.drawContours(b_mask, [contour], -1, (255, 255, 255), cv2.FILLED)
            mask3ch = cv2.cvtColor(b_mask, cv2.COLOR_GRAY2BGR)
            isolated = cv2.bitwise_and(mask3ch, img)
            cv2.imwrite(att_dir_output_Path.joinpath('isolated_'+str(index)+'_' + Path(image_path).name).absolute().as_posix(), isolated)

def yolo_decade(raw=None,imagePath=None,allImages=None):
    resultFinal=[]
    # yolo_results=yolo_model(imagePath,  classes=[2,3])
    if allImages is None:
        # yolo_results = yolo_model(imagePath,classes=0)
        Thread(target=thread_safe_predict, args=(yolo_model, imagePath)).start()
    else:
        yolo_results = yolo_model(allImages)
    # print(datetime.datetime.now(), "[1][yolo_decade]",
    #       # yolo_results[0].names,
    #       yolo_results[0].boxes.cls,
    #       # yolo_results[0].boxes.data,
    #       "[1][yolo_decade]conf=",yolo_results[0].boxes.conf,
    #       yolo_results[0].boxes.xywh,
    #       # yolo_results[0].plot()
    #       )
    # boxes = yolo_results[0].boxes.xyxy

    # for index,box in enumerate(boxes):
    #     # if yolo_results[0].boxes.conf[index] <0.8:
    #     #     continue
    #
    #     # box=box.cpu().numpy()
    #     x1 = int(box[0])
    #     y1 = int(box[1])
    #     x2 = int(box[2])
    #     y2 = int(box[3])
    #     cv2.rectangle(raw, (x1, y1), (x2, y2), (0, 255, 0), 2)
    #     tmp = cv2.cvtColor(raw[y1:y2, x1:x2].copy(), cv2.COLOR_RGB2GRAY)
    #
    #     # img = text(raw, license, (x1, y1 - 20), (0, 255, 0), 25)
    #     plt.imshow(tmp)
    #     plt.title("yolo_plate_decade")
    #     plt.show()
    # # plt.subplot(2,3,i+1)
    # # plt.axis("off")
    # # plt.imshow(raw)
    # # for result in yolo_results:
    # #     result.show()
    # # annotated_frame=result[0].plot
    # # cv2.imshow("yolo_decade",annotated_frame)
    # plt.imshow(X=yolo_results[0].plot()[:,:,::-1])
    # plt.title("yolo_decade")
    # plt.show()

    return resultFinal

directory_modified(att_dir_input, 5)

#pip install ultralytics
# yolo predict model=car_plate.pt source='input/wt1.png'
