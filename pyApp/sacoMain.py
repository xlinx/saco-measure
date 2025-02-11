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
# from SotaTool_decade_tw import run_sota
# from shapely.geometry import Polygon
#############
from skimage import (restoration)
import warnings
import numpy as np
from skimage.feature import greycomatrix, greycoprops
import cv2
import os
import matplotlib.pyplot as plt
import pandas as pd
import glob
import imutils
from scipy.signal import find_peaks
from scipy.interpolate import CubicSpline
import matplotlib
from tqdm import tqdm
import seaborn as sns
import multiprocessing
from joblib import Parallel, delayed

DECADE_MODEL='best.pt'
home = Path.home().joinpath('sacoMeasure')
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
    segments=0
    background = 0
    skip_graph_save_time = 0
    output_Interpolated_data = 0
    var1=background
    var3 = skip_graph_save_time
    var2=segments
    var4 = output_Interpolated_data
    tilevaly=0
    tilevalx=0

# Path_X=dict()
# for f in [e.value for e in fNameX]:
for f in fNameX:
    f['pathObjX'] = home.joinpath( f['nameX'] )
    f['pathStrX'] = home.joinpath(f['nameX']).absolute().as_posix()
    if not os.path.exists(f['pathStrX']):
        os.makedirs(f['pathStrX'])
    print('[IONIS][working-folder][init]', f['pathStrX'])

DECADE_MODEL_PATH=fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL)
SOTA_ALL_VAR.inx = fNameX.output['pathStrX']
SOTA_ALL_VAR.outx = fNameX.sota['pathStrX']

# print('[][][]',list(map(dict, fNameX)))
if not os.path.exists(DECADE_MODEL_PATH):
    print('[X][model_ai][load-not-found]',DECADE_MODEL_PATH)
    exit(0)
else:
    print('[OK][model_ai][load]', DECADE_MODEL_PATH)

yolo_model = YOLO(fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL))
for each_file in fNameX.input['pathObjX'].glob('*.*'): # grabs all files
    each_file.rename(fNameX.output['pathObjX'].joinpath(each_file.name)) # moves to parent folder.

def LIST_SOTA():
    for i in (vars(SOTA_ALL_VAR)):
        if not (i.startswith('__') or i.startswith('var')):
            print("[SOTA] {0:20}: {1}".format(i, vars(SOTA_ALL_VAR)[i]))
LIST_SOTA()
# def run_sota(inx=None,outx=None):
def run_sota(ALL_VAR):
    SOTA_ALL_X=ALL_VAR

    matplotlib.use("Agg")
    warnings.filterwarnings("ignore")  # I know, I know..
    num_cores = multiprocessing.cpu_count()

    # CoV-formula, input from user translations and output folder creation
    cv = lambda x: np.std(x, ddof=1) / np.mean(x) * 100
    input_dir = SOTA_ALL_X.inx
    output_dir = SOTA_ALL_X.outx
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    folderLen = len(input_dir)
    Summary = pd.DataFrame()
    voxel = float(SOTA_ALL_X.voxelvalue)
    noise_red_val = int(SOTA_ALL_X.noise_red_val)
    print('[][][]voxel', voxel)
    # If boxes are empty, use default values for ballsize and maxlength
    if SOTA_ALL_X.offset_val == 0:  # 4 um default offset size
        prompt = round(voxel * 4)
    else:
        prompt = round(float(SOTA_ALL_X.offset_val) * voxel)
    if SOTA_ALL_X.ballsize_val == 0:  # rolling ball size, default 2um
        ballsize_val = round(voxel * 2)
    else:
        ballsize_val = round(float(SOTA_ALL_X.ballsize_val) * voxel)
    if SOTA_ALL_X.max_length_val == 0:
        max_length_val = prompt
    else:
        max_length_val = round(float(SOTA_ALL_X.max_length_val) * voxel)
    # print('[][][]prompt',prompt)
    x = np.arange(1, prompt, 1)
    x = x * (1 / voxel)
    max_x=prompt* (1 / voxel)
    x_new = np.linspace((1 / voxel), max_x, prompt * 100)
    # print('[][][0]x_new', x_new)
    distances = [*range(1, prompt, 1)]
    distances2 = [*range(0, prompt - 1, 1)]
    angles = [*range(1, 181, 1)]
    # print('[][][]distances', distances)
    # print('[][][]distances2', distances2)
    # print('[][][]angles', angles)
    # Tiling
    if SOTA_ALL_X.var2 == 1:
        tiling_dir = input_dir + '/segments'
        if not os.path.exists(tiling_dir):
            os.makedirs(tiling_dir)
        files = glob.glob(tiling_dir + '/*')
        for f in files:
            os.remove(f)
        tileval_y = SOTA_ALL_X.tilevaly
        tileval_x = SOTA_ALL_X.tilevalx
        for img in glob.glob(input_dir + "/*.tif"):
            image = cv2.imread(img)
            image2 = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            numrows = int(tileval_x)
            numcols = int(tileval_y)
            height = int(image2.shape[0] / numrows)
            width = int(image2.shape[1] / numcols)
            for row in range(numrows):
                for col in range(numcols):
                    y0 = row * height
                    y1 = y0 + height
                    x0 = col * width
                    x1 = x0 + width
                    cv2.imwrite(tiling_dir + '/' + img[folderLen:].replace('.tif', '') + '_tile_%d%d.tif' % (row, col), image2[y0:y1, x0:x1])

    def algorithm(iAngle):
        rotateI = imutils.rotate_bound(gray_image, iAngle)
        glcm = greycomatrix(rotateI,
                            distances=distances,
                            angles=[0],
                            symmetric=False,
                            normed=False)[noise_red_val:, noise_red_val:, :, :]

        correlation = greycoprops(glcm, 'correlation')
        df = pd.DataFrame(correlation)
        df2[iAngle] = df
        # asm = greycoprops(glcm[:, :, 0:1, :], 'ASM').mean()
        # homogeneity = greycoprops(glcm[:, :, 0:1, :], 'homogeneity').mean()


    # List files:
    if SOTA_ALL_X.var2 == 1:
        files = glob.glob(input_dir + "/*.tif") + glob.glob(tiling_dir + "/*.tif")
    else:
        files = glob.glob(input_dir + "/*.tif")

    # Analysis GLCM and sarcomere length, loop over folder
    for img in tqdm(files):
        image = cv2.imread(img)
        image_ID = '/' + img[folderLen:].replace('.tif', '').replace('\\', '').replace('/segments', '')
        # image = cv2.imread('C:/Users/stein/Documents/Python/Raw data for article/Matthew cells/TID/Image005_TID_ch01.tif')

        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Background subtraction
        if SOTA_ALL_X.var1 == 1:
            background = restoration.rolling_ball(gray_image, radius=int(ballsize_val))
            gray_image = gray_image - background

        # prepare dataframes for loop
        df2 = pd.DataFrame(index=distances2, columns=angles)
        df2 = df2.astype(np.float32)

        # multithread function of GLCM and save df2 to .csv
        Parallel(n_jobs=num_cores, prefer="threads")(delayed(algorithm)(iAngle) for iAngle in angles)

        df2.to_csv(output_dir + image_ID + '_corr' + ".csv")

        # Peak detection in and amplitude calculation in all curves
        # maximum sarcomere length taken into account here
        peaks = []
        for column in df2:
            ser = pd.Series(df2[column][:max_length_val])
            indices = find_peaks(ser)[0]
            flag = not np.any(indices)
            if flag:
                indices = np.array([1, 1])
            peak = pd.Series(ser[indices[0]] - min(ser[0:indices[0]]))
            peaks.append(peak)

        peak2 = {'angle': pd.Series(range(1, 181)), 'SOS': [i[0] for i in peaks]}
        peaklist = pd.DataFrame(peak2)
        SOS_max = peaklist.iloc[peaklist.SOS.argmax()]

        # So now we have the angle and SOS of the highest curve. Now we need to extract the sarcomere length from df2
        # using the splined data
        max_curve = pd.Series(df2[SOS_max[0]])
        y = np.array(max_curve.values.tolist())
        f = CubicSpline(x, y, bc_type='natural')
        y_new = f(x_new)
        scaled_maxcurve = pd.DataFrame(pd.Series(x_new), columns=['Offset'])
        scaled_maxcurve['Correlation'] = y_new.tolist()
        if SOTA_ALL_X.var4 == 1:
            scaled_maxcurve.to_csv(output_dir + image_ID + 'int' + ".csv")

        peak_s_length = find_peaks(y_new)[0]
        flag = not np.any(peak_s_length)
        if flag:  # these parameters should be 0 if there are no peaks in the splined graph
            s_length = 'NA'
            angle_val = 'NA'
            SOS = 'NA'
        else:
            s_length = round(scaled_maxcurve.iloc[peak_s_length[0]][0], 3)
            angle_val = int(SOS_max[0])
            SOS = SOS_max[1]

        # Sure, just calculate the Coefficient of Variation real quick
        CoV_offset = find_peaks(np.array(df2[SOS_max[0]]))
        if not np.any(CoV_offset[0]):
            CoV = 'NA'
            CoV_offset = np.array([[0.0], [0]], dtype=np.int64)
        else:
            CoV = cv(df2.iloc[[CoV_offset[0][0] + 1]].squeeze()[1:])

        # Create epic graph which took way too long to design, fml
        # Melt df, order hues on CoV-offset in a list, choose palette, plot all lines with seaborn
        if SOTA_ALL_X.var3 == 0:
            df2.insert(loc=0, column='Offset', value=x)
            df2 = df2.drop([90], axis=1)
            df2 = df2.drop([180],  axis=1)
            angles2 = [e for e in angles if e not in (90, 180)]
            df3 = pd.melt(df2, 'Offset')
            hue_order = df2.iloc[[CoV_offset[0][0] + 1]].drop(['Offset'], axis=1).transpose().assign(angle=angles2)
            hue_order = hue_order.sort_values(by=hue_order.columns[0])
            hue_order = hue_order['angle'].values.tolist()

            colors = sns.color_palette('light:b', n_colors=len(hue_order))

            plt.close('all')
            plt.scatter(x, y, marker='x', c='black')  # Add raw points of best graph
            ax = sns.lineplot(x='Offset', y='value', hue='variable', data=df3, alpha=0.3, palette=colors, legend=False,
                              hue_order=hue_order)  # Add all angles
            # ax.grid(b=True, which='major', color='black', linewidth=0.075)
            ax.grid(which='major', color='black', linewidth=0.075)
            if s_length == 'NA':  # Create abline, but on 0 if s_length not detected
                plt.axvline(x=0, c='black')
            else:
                plt.axvline(x=s_length, c='black')
            plt.plot(scaled_maxcurve['Offset'], scaled_maxcurve['Correlation'], 'b')  # add splined graph
            plt.xlabel('Offset [um]')
            plt.ylabel('Correlation')
            fig = plt.gcf()
            fig.savefig(output_dir + image_ID + '_output' + '.tif')

        # Create new GLCM with furthest pixel offset for ASM and Homogeneity
        glcm = greycomatrix(gray_image,
                            distances=[max(distances2)],
                            angles=[0],
                            symmetric=False,
                            normed=False)[noise_red_val:, noise_red_val:, :, :]
        asm = greycoprops(glcm[:, :, 0:1, :], 'ASM').mean()
        homogeneity = greycoprops(glcm[:, :, 0:1, :], 'homogeneity').mean()

        ### Compile useful output in summary excel file
        data = [
            [img[folderLen:].replace('.tif', '').replace('\\', '').replace('segments', ''), s_length, angle_val, SOS, CoV,
             asm, homogeneity]]
        final = pd.DataFrame(data, columns=['Name', 'Sarcomere length', 'Angle', 'Sarcomere Organization Score',
                                            'Alignment index', 'Uniformity', 'Homogeneity'])
        Summary = Summary._append(final)
        Summary.to_csv(output_dir + "/Summary" +  ".csv")

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
            print(datetime.datetime.now(),"[O][ionis][AI-Model-Level=medium][InputFolder][monitoring..]",fNameX.input['pathStrX'])
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
        # run_sota(fNameX.output['pathStrX'],fNameX.sota['pathStrX'])
    else:
        yolo_results = yolo_model(allImages)

    SOTA_ALL_VAR.voxelvalue=1.1
    LIST_SOTA()
    Thread(target=run_sota, args=[SOTA_ALL_VAR] ).start()
    return resultFinal



directory_modified(fNameX.input['pathStrX'], 5)
# run_sota(fNameX.output['pathStrX'], fNameX.sota['pathStrX'])

#pip install ultralytics
# yolo predict model=car_plate.pt source='input/wt1.png'
#pyinstaller -F sacoMain.py
# pyinstaller -D sacoMain.py
#pip install pyinstaller