import os
import threading
import time
from enum import Enum
from pathlib import Path
import datetime
import glob
from threading import Thread
import cv2
import numpy as np

from ultralytics import YOLO

from SotaTool_decade_tw import run_sota

# from shapely.geometry import Polygon
DECADE_MODEL='best.pt'
home = Path.home().joinpath('sacoMeasure')

class fNameX(dict, Enum):
    input:dict =     {'pathObjX':None,'pathStrX':'','nameX': 'input'}
    processed:dict = {'pathObjX':None,'pathStrX':'','nameX': 'processed',}
    output:dict =    {'pathObjX':None,'pathStrX':'','nameX': 'output'}
    modelAI:dict =   {'pathObjX':None,'pathStrX':'','nameX': 'modelAI'}
    sota: dict     = {'pathObjX': None, 'pathStrX': '', 'nameX': 'sota'}


# Path_X=dict()
# for f in [e.value for e in fNameX]:
for f in fNameX:
    f['pathObjX'] = home.joinpath( f['nameX'] )
    f['pathStrX'] = home.joinpath(f['nameX']).absolute().as_posix()
    if not os.path.exists(f['pathStrX']):
        os.makedirs(f['pathStrX'])
    print('[O][working-folder][init]', f['pathStrX'])

DECADE_MODEL_PATH=fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL)

# print('[][][]',list(map(dict, fNameX)))
if not os.path.exists(DECADE_MODEL_PATH):
    print('[X][model_ai][load-not-found]',DECADE_MODEL_PATH)
    exit(0)
else:
    print('[OK][model_ai][load]', DECADE_MODEL_PATH)

yolo_model = YOLO(fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL))
for each_file in fNameX.input['pathObjX'].glob('*.*'): # grabs all files
    each_file.rename(fNameX.output['pathObjX'].joinpath(each_file.name)) # moves to parent folder.

def directory_modified(dir_path, poll_timeout=1):
    init_mtime = os.stat(dir_path).st_mtime
    while True:
        now_mtime = os.stat(dir_path).st_mtime
        if init_mtime != now_mtime:
            init_mtime = now_mtime
            print(datetime.datetime.now(),"[1][decade.tw][monitor][different]input=",fNameX.input,", output=",fNameX.output)
            allImages = []
            for ext in ('*.gif', '*.png', '*.jpg','*.tif'):
                allImages.extend(glob.glob(fNameX.input['pathStrX']+os.sep+ ext))
            # allImages=glob.glob(att_dir_input+os.sep+'*.jpg')
            print(datetime.datetime.now(), "[2][decade.tw][monitor][different]allImages=", allImages)
            # yolo_decade(None,None,allImages)
            for imagepathObjX in allImages:
                # step1_rawImageX=cv2.imread(imagepathObjX)
                yolo_decade(None,imagepathObjX)
                # os.remove(imagepathObjX)
        else:
            print(datetime.datetime.now(),"[3][decade.tw][monitor][same]input=",fNameX.input)
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
        result.save(filename=fNameX.processed['pathObjX'].joinpath( Path(image_path).name+'.AI' + Path(image_path).suffix ))

        Path(image_path).rename(fNameX.processed['pathObjX'].joinpath(Path(image_path).name))

        for index in range(len(masks)):
            img = np.copy(result.orig_img)
            b_mask = np.zeros(img.shape[:2], np.uint8)
            contour = masks[index].xy[0].astype(np.int32).reshape(-1, 1, 2)
            cv2.drawContours(b_mask, [contour], -1, (255, 255, 255), cv2.FILLED)
            mask3ch = cv2.cvtColor(b_mask, cv2.COLOR_GRAY2BGR)
            isolated = cv2.bitwise_and(mask3ch, img)
            cv2.imwrite(fNameX.output['pathObjX'].joinpath(Path(image_path).name+'.ISO.'+str(index)+'' + Path(image_path).suffix).absolute().as_posix(), isolated)

def yolo_decade(raw=None,imagePath=None,allImages=None):
    resultFinal=[]
    # yolo_results=yolo_model(imagePath,  classes=[2,3])
    if allImages is None:
        # yolo_results = yolo_model(imagePath,classes=0)
        threadX=threading.Thread(target=thread_safe_predict, args=(yolo_model, imagePath))
        threadX.start()
        threadX.join()
        run_sota(fNameX.output['pathStrX'],fNameX.sota['pathStrX'])
    else:
        yolo_results = yolo_model(allImages)

    return resultFinal

directory_modified(fNameX.input['pathStrX'], 5)
# run_sota(fNameX.output['pathStrX'], fNameX.sota['pathStrX'])

#pip install ultralytics
# yolo predict model=car_plate.pt source='input/wt1.png'
#pyinstaller -F sacoMain.py
# pyinstaller -D sacoMain.py
#pip install pyinstaller