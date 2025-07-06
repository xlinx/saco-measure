import math
import os
import shutil
import threading
import time
from enum import Enum
from pathlib import Path
import datetime
# import glob
from threading import Thread
# import cv2
# import json

import numpy
from ultralytics import YOLO
# from SotaTool_decade_tw import run_sota
# from shapely.geometry import Polygon
#############
# from skimage import (restoration)
# import warnings
# import numpy as np
# from skimage.feature import graycomatrix, graycoprops
import cv2
import os
#import matplotlib.pyplot as plt
import pandas as pd
import glob
# import imutils
#from scipy.signal import find_peaks
#from scipy.interpolate import CubicSpline
#import matplotlib
#from tqdm import tqdm
#import seaborn as sns
import multiprocessing
from joblib import Parallel, delayed

# DECADE_MODEL='best.pt'
# DECADE_MODEL='best_redSeg_ultralytics.pt'
ALL_FORMAT=('*.png', '*.jpg','*.tif')
ALL_FORMAT_STR='*.{png,jpg,tif}'
DECADE_MODEL='redv1.pt'
home = Path.home().joinpath('sarcoMeasure')

class BColors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

class fNameX(dict, Enum):
    input:dict =     {'pathObjX':None,'pathStrX':'','nameX': 'input'}
    processed:dict = {'pathObjX':None,'pathStrX':'','nameX': 'processed',}
    output:dict =    {'pathObjX':None,'pathStrX':'','nameX': 'output'}
    modelAI:dict =   {'pathObjX':None,'pathStrX':'','nameX': 'modelAI'}
    sota: dict     = {'pathObjX': None, 'pathStrX': '', 'nameX': 'sota'}

class SOTA_ALL_VAR():
    inx:str=''
    outx: str = ''
    voxelvalue:float =     5
    noise_red_val:int = 1
    offset_val = 0
    ballsize_val:int = 0
    max_length_val: int = 0
    segments=1
    background = 0
    skip_graph_save_time = 0
    output_Interpolated_data = 0
    tilevaly:int=10
    tilevalx:int=10
    tiling_dir:str= ''
    # var1=background
    # var3 = skip_graph_save_time
    # var2=segments
    # var4 = output_Interpolated_data


# Path_X=dict()
# for f in [e.value for e in fNameX]:
for f in fNameX:
    f['pathObjX'] = home.joinpath( f['nameX'] )
    f['pathStrX'] = home.joinpath(f['nameX']).absolute()
    if not os.path.exists(f['pathStrX']):
        os.makedirs(f['pathStrX'])
    print('[IONIS][working-folder][init]', f['pathStrX'])

DECADE_MODEL_PATH=fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL)
SOTA_ALL_VAR.inx = fNameX.output['pathStrX']
SOTA_ALL_VAR.outx = fNameX.sota['pathStrX']
SOTA_ALL_VAR.tiling_dir= fNameX.sota['pathObjX'].joinpath('segments').absolute()

# print('[][][]',list(map(dict, fNameX)))
if not os.path.exists(DECADE_MODEL_PATH):
    print('[X][model_ai][load-not-found]',DECADE_MODEL_PATH)
    exit(0)
else:
    print('[OK][model_ai][load]', DECADE_MODEL_PATH)

# yolo_model = YOLO(fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL))
yolo_model = YOLO(model=fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL))
print('[][DECADE.TW][ML-MODEL-INFO]',yolo_model.names)

for each_file in fNameX.input['pathObjX'].glob('*.*'): # grabs all files
    each_file.rename(fNameX.output['pathObjX'].joinpath(each_file.name)) # moves to parent folder.

def LIST_SOTA():
    for i in (vars(SOTA_ALL_VAR)):
        if not (i.startswith('__') or i.startswith('var')):
            print("[SOTA] {0:20}: {1}".format(i, vars(SOTA_ALL_VAR)[i]))
LIST_SOTA()
# def run_sota(inx=None,outx=None):
def run_sota(ALL_VAR):
    print('[][][fullAI]')

def directory_modified(dir_path, poll_timeout=1):
    init_mtime = os.stat(dir_path).st_mtime
    while True:
        now_mtime = os.stat(dir_path).st_mtime
        if init_mtime != now_mtime:
            init_mtime = now_mtime
            print(datetime.datetime.now(),"[1][decade.tw][monitor][different]input=",fNameX.input,", output=",fNameX.output)
            allImages = []
            for ext in ALL_FORMAT:
                allImages.extend(glob.glob(os.path.join(fNameX.input['pathStrX'],ext)))
            # allImages=glob.glob(att_dir_input+os.sep+'*.jpg')
            print(datetime.datetime.now(), "[2][decade.tw][monitor][different]allImages=", allImages)
            # yolo_decade(None,None,allImages)
            for imagepathObjX in allImages:
                # step1_rawImageX=cv2.imread(imagepathObjX)
                yolo_decade(None,imagepathObjX)
                # os.remove(imagepathObjX)
        else:
            print(datetime.datetime.now(),"[O][ionis][AI-Model-Level=medium][InputFolder][monitoring..]",BColors.WARNING ,fNameX.input['pathStrX'],BColors.ENDC)

        time.sleep(poll_timeout)
def euclidean_distance(p1, p2):
    """DECADE.TW
    Calculates the Euclidean distance between two points in 2D or 3D.
    p1 and p2 should be tuples or lists of coordinates (e.g., (x1, y1) or (x1, y1, z1)).
    """
    if len(p1) != len(p2):
        raise ValueError("Points must have the same number of dimensions.")

    sum_sq_diff = sum([(coord1 - coord2)**2 for coord1, coord2 in zip(p1, p2)])
    return math.sqrt(sum_sq_diff)


def draw_lines_with_distAll(img, kp_xy, color=(255, 255, 255,128), thickness=1):
    """DECADE.TW
    Draws lines between keypoints on the image.
    kp_xy: list of 4 (x, y) tuples or lists.
    Draws lines for all pairs whose distances are in distAll.
    """
    # Edges
    cv2.line(img, tuple(map(int, kp_xy[0])), tuple(map(int, kp_xy[1])), color, thickness)  # d01
    cv2.line(img, tuple(map(int, kp_xy[1])), tuple(map(int, kp_xy[2])), color, thickness)  # d12
    cv2.line(img, tuple(map(int, kp_xy[2])), tuple(map(int, kp_xy[3])), color, thickness)  # d23
    cv2.line(img, tuple(map(int, kp_xy[3])), tuple(map(int, kp_xy[0])), color, thickness)  # d03
    # Diagonals
    cv2.line(img, tuple(map(int, kp_xy[0])), tuple(map(int, kp_xy[2])), color, thickness)  # d02
    cv2.line(img, tuple(map(int, kp_xy[1])), tuple(map(int, kp_xy[3])), color, thickness)  # d13
    return img

def area_from_four_points(pts):
    """DECADE.TW
    pts: list of four (x, y) tuples/lists, ordered around the quadrilateral.
    Returns the area.
    """
    x0, y0 = pts[0]
    x1, y1 = pts[1]
    x2, y2 = pts[2]
    x3, y3 = pts[3]
    return 0.5 * abs(
        x0*y1 + x1*y2 + x2*y3 + x3*y0
        - y0*x1 - y1*x2 - y2*x3 - y3*x0
    )
import numpy as np

def point_to_segment_distance(p, a, b):
    """DECADE.TW Returns the minimum distance from point p to segment ab."""
    p = np.array(p)
    a = np.array(a)
    b = np.array(b)
    if np.all(a == b):
        return np.linalg.norm(p - a)
    t = np.clip(np.dot(p - a, b - a) / np.dot(b - a, b - a), 0, 1)
    projection = a + t * (b - a)
    return np.linalg.norm(p - projection)

def segment_to_segment_distance(a1, a2, b1, b2):
    """DECADE.TW Returns the minimum distance between segment a1-a2 and segment b1-b2."""
    # Check all endpoints to the other segment
    return min(
        point_to_segment_distance(a1, b1, b2),
        point_to_segment_distance(a2, b1, b2),
        point_to_segment_distance(b1, a1, a2),
        point_to_segment_distance(b2, a1, a2)
    )
def thread_safe_predict(_yolo_model, _image_path):
    imgNameFolder=fNameX.output['pathObjX'].joinpath(Path(_image_path).stem)
    print('[][start-predict][0][imgNameFolder]=', imgNameFolder)
    print('[][start-predict][0][_yolo_model.names]=', _yolo_model.names)

    if os.path.exists(imgNameFolder):
        shutil.rmtree(imgNameFolder.absolute())
    # for which_class in range(len(_yolo_model.names)):
    # for which_class in range(len(_yolo_model.names)):
    #     print('[][start-predict][00][which_class]=', which_class)
    # for which_class_key in _yolo_model.names:
    #     print('[][start-predict][000][which_class]=', which_class_key)
    for which_class_key in _yolo_model.names:
        which_class=_yolo_model.names[which_class_key]


        confX=0.01
        yolo_results=[]
        while len(yolo_results)==0 and confX > 0 :
            print('[][start-predict][0][trying conf]=', BColors.WARNING ,confX,BColors.ENDC, which_class)
            yolo_results = _yolo_model.predict(source=_image_path, classes=[which_class_key], conf=confX)
            confX-=0.0001
            if len(yolo_results)>0 :
                break
        classFolder = imgNameFolder.joinpath(which_class)
        cropFolder = classFolder.joinpath('crop')
        cropFolder.mkdir(mode=0o777, parents=True, exist_ok=True)
        maskFolder = classFolder.joinpath('mask')
        maskFolder.mkdir(mode=0o777, parents=True, exist_ok=True)
        resultFolder = classFolder.joinpath('result')
        resultFolder.mkdir(mode=0o777, parents=True, exist_ok=True)


        print('[][start-predict][0][using conf]=', BColors.WARNING ,confX,BColors.ENDC)
        print('[][start-predict][0][using classFolder]=', BColors.WARNING ,classFolder,BColors.ENDC)
        print('[][start-predict][0][using cropFolder]=', BColors.WARNING ,cropFolder,BColors.ENDC)
        # print('[][start-predict][0][using isoFolder]=', BColors.WARNING ,isoFolder,BColors.ENDC)
        print('[][start-predict][0][using len(yolo_results)]=', len(yolo_results))
        # print('[][start-predict][0][using yolo_results]=', yolo_results)

        for result_index in range(len(yolo_results)):
        # for result in yolo_results:


            result=yolo_results[result_index]
            boxes = result.boxes.cpu().numpy()
            keypoints = result.keypoints.cpu().numpy()
            # masks = result.masks.cpu().numpy()
            # probs = result.probs.cpu().numpy()
            # obb = result.obbs.cpu().numpy()
            result.save(filename=classFolder.joinpath('result_All_ID_' + str(result_index)+'__' + Path(_image_path).name) )
            result.save_crop(save_dir=cropFolder,file_name='result_Crop_ID_' + str(result_index)+'__' + Path(_image_path).name)
            result.save_txt(txt_file=classFolder.joinpath('result_Txt_ID_' + str(result_index)+'__' + Path(_image_path).stem+'.txt') )

            masks = result.masks  # Masks object for segmentation masks outputs
            if masks is not None:
                for index in range(len(masks)):
                    img = numpy.copy(yolo_results[result_index].orig_img)
                    b_mask = numpy.zeros(img.shape[:2], numpy.uint8)
                    contour = masks[index].xy[0].astype(numpy.int32).reshape(-1, 1, 2)

                    cv2.drawContours(b_mask, [contour], -1, (255, 255, 255), cv2.FILLED)
                    mask3ch = cv2.cvtColor(b_mask, cv2.COLOR_GRAY2BGR)
                    isolated = cv2.bitwise_and(mask3ch, img)
                    # crop_img = img[y:y + h, x:x + w]
                    # save_path_iso= isoFolder.joinpath('iso.' + str(index) + Path(_image_path).suffix)
                    cv2.imwrite(maskFolder, isolated)

            print('[][start-predict][1][len]=', BColors.BOLD ,len(boxes),len(keypoints),BColors.ENDC)
            # ''' 0---1
            #        /
            #       /
            #     2---3
            # '''
            list = []
            img_with_lines = numpy.copy(yolo_results[result_index].orig_img)
            drawRedLine_filename = classFolder.joinpath(f'predict_{which_class}__' + Path(_image_path).name)
            for box_index in range(len(boxes)):
            # for box in boxes:
                box = boxes[box_index]
                cls = int(box.cls[0])
                id=box.id
                path = result.path
                class_name = _yolo_model.names[cls]
                conf = box.conf
                bx_xywh = box.xywh.tolist()
                bx_xywhn = box.xywhn.tolist()

                kp_xy = keypoints.xy.tolist()[box_index]
                # Save the PNG with all boxes' lines after the loop
                draw_lines_with_distAll(img_with_lines, kp_xy)
                cv2.imwrite(str(drawRedLine_filename), img_with_lines)
                # kp_xyn = kp.xyn.tolist()
                d01=euclidean_distance(kp_xy[0], kp_xy[1])
                d12=euclidean_distance(kp_xy[1], kp_xy[2])
                d23=euclidean_distance(kp_xy[2], kp_xy[3])
                d03=euclidean_distance(kp_xy[0], kp_xy[3])
                d02=euclidean_distance(kp_xy[0], kp_xy[2])
                d13=euclidean_distance(kp_xy[1], kp_xy[3])
                distAll=[d01,d12,d23, d03,d02,d13]
                # Calculate 2D area
                areaVolumn = area_from_four_points(kp_xy)
                # 2D volume is always zero

                line_distance_01_23 = segment_to_segment_distance(kp_xy[0], kp_xy[1], kp_xy[2], kp_xy[3])
                v1 = np.array(kp_xy[1]) - np.array(kp_xy[0])
                v2 = np.array(kp_xy[2]) - np.array(kp_xy[1])
                v3 = np.array(kp_xy[3]) - np.array(kp_xy[2])
                dot_v1_v2 = np.dot(v1, v2)
                cross_v1_v2 = v1[0]*v2[1] - v1[1]*v2[0]
                dot_v2_v3 = np.dot( v2,v3)
                cross_v2_v3 = v2[0]*v3[1] - v2[1]*v3[0]
                df = pd.DataFrame({
                                   'result_index':result_index,
                                   'perdictBoxIndex':box_index,
                                   'className': class_name,
                                   # 'class_id': cls,
                                   'perdictConfidence': conf,
                                   'perdictQuadrilateralArea': areaVolumn,
                                    'dist01':d01,':dist12':d12,':dist23':d23,
                                    'dist03':d03,':dist03':d02,':dist13':d13,
                                    'vectorDist_01_23': line_distance_01_23,
                                    'dotProduct_01_12': dot_v1_v2,
                                    'crossProduct_01_12': cross_v1_v2,
                                    'dotProduct_12_13': dot_v2_v3,
                                    'crossProduct_12_13': cross_v2_v3,


                                    # 'dist-01-12-23-03-02-13-pixel':str(distAll),
                                   'bx_xywh': bx_xywh,
                                   'bx_xywh_normalize':bx_xywhn,
                                   'path': path,

                                   })
                list.append(df)



            df = pd.concat(list)
            df.to_csv(classFolder.joinpath('AI.' +which_class+ '.predict.box.csv'), index=False)




        # for result_index in range(len(yolo_results)):

            # if cropFolder.joinpath(which_class).exists():
            #     os.rename(cropFolder.joinpath(which_class),cropFolder.joinpath('crop'))
            # keypoints = result.keypoints  # Keypoints object for pose outputs
            # probs = result.probs  # Probs object for classification outputs
            # obb = result.obb  # Oriented boxes object for OBB outputs
            # result.show()  # display to screen

    Path(_image_path).rename(fNameX.processed['pathObjX'] / Path(_image_path).name)


def yolo_decade(raw=None,imagePath=None,allImages=None):
    resultFinal=[]
    # yolo_results=yolo_model(imagePath,  classes=[2,3])
    if allImages is None:
        # yolo_results = yolo_model(imagePath,classes=0)
        try:
            threadX=threading.Thread(target=thread_safe_predict, args=(yolo_model, imagePath))
            threadX.start()
            threadX.join()
        except:
            print('[][yolo_decade][]=')
        # run_sota(fNameX.output['pathStrX'],fNameX.sota['pathStrX'])
        SOTA_ALL_VAR.voxelvalue=1.1
        # LIST_SOTA()
        Thread(target=run_sota, args=[SOTA_ALL_VAR] ).start()
    else:
        yolo_results = yolo_model(allImages)


    return resultFinal



directory_modified(fNameX.input['pathStrX'], 5)
# Thread(target=run_sota, args=[SOTA_ALL_VAR] ).start()
# run_sota(fNameX.output['pathStrX'], fNameX.sota['pathStrX'])

#pip install ultralytics
# yolo predict model=car_plate.pt source='input/wt1.png'
#pyinstaller -F sacoMain.py
# pyinstaller -D sacoMain.py
#pip install pyinstaller
#pip uninstall -y -r <(pip freeze)
#pipreqs --ignore .venv --force --savepath requirments.now.txt ./