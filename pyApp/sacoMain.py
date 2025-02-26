import os
import shutil
import threading
import time
from enum import Enum
from pathlib import Path
import datetime
import glob
from threading import Thread
import cv2
import numpy
from ultralytics import YOLO
# from SotaTool_decade_tw import run_sota
# from shapely.geometry import Polygon
#############
from skimage import (restoration)
import warnings
# import numpy as np
from skimage.feature import graycomatrix, graycoprops
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

# DECADE_MODEL='best.pt'
# DECADE_MODEL='best_redSeg_ultralytics.pt'
ALL_FORMAT=('*.png', '*.jpg','*.tif')
ALL_FORMAT_STR='*.{png,jpg,tif}'
DECADE_MODEL='model_- 24 february 2025 4_22.pt'
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

yolo_model = YOLO(fNameX.modelAI['pathObjX'].joinpath(DECADE_MODEL))
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
    SOTA_ALL_X=ALL_VAR

    matplotlib.use("Agg")
    warnings.filterwarnings("ignore")  # I know, I know..
    num_cores = multiprocessing.cpu_count()

    # CoV-formula, input from user translations and output folder creation
    cv = lambda x: numpy.std(x, ddof=1) / numpy.mean(x) * 100
    
    
    if not os.path.exists(SOTA_ALL_X.outx):
        os.makedirs(SOTA_ALL_X.outx)
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
    x = numpy.arange(1, prompt, 1)
    print('x1',x)
    x = x * (1 / voxel)
    print('x2', x)
    max_x=prompt* (1 / voxel)
    x_new = numpy.linspace((1 / voxel), max_x, prompt * 100)
    # print('[][][0]x_new', x_new)
    distances = [*range(1, prompt, 1)]
    distances2 = [*range(0, prompt - 1, 1)]
    print('distances', distances)
    print('distances2', distances2)
    angles = [*range(1, 181, 1)]
    print('angles', angles)
    # print('[][][]distances', distances)
    # print('[][][]distances2', distances2)
    # print('[][][]angles', angles)
    # Tiling
    if SOTA_ALL_X.segments == 1:

        if not os.path.exists(SOTA_ALL_VAR.tiling_dir):
            os.makedirs(SOTA_ALL_VAR.tiling_dir)
        files = glob.glob(os.path.join(SOTA_ALL_VAR.tiling_dir , '*'))
        for f in files:
            os.remove(f)
        allImages = []
        for ext in ALL_FORMAT:
            allImages.extend(glob.glob(os.path.join(fNameX.input['pathStrX'],ext)))
        print(datetime.datetime.now(), "[2][decade.tw][monitor][different]allImages=", allImages)
        for img in allImages:
        # for img in glob.glob(os.path.join(SOTA_ALL_X.inx , "*.tif")):
            image2 = cv2.cvtColor(cv2.imread(img), cv2.COLOR_BGR2GRAY)
            # print('img[folderLen:]',img[folderLen:])
            height = int(image2.shape[0] / SOTA_ALL_X.tilevalx)
            width = int(image2.shape[1] / SOTA_ALL_X.tilevaly)
            for row in range(SOTA_ALL_X.tilevalx):
                for col in range(SOTA_ALL_X.tilevaly):
                    y0 = row * height
                    y1 = y0 + height
                    x0 = col * width
                    x1 = x0 + width
                    cv2.imwrite(os.path.join(SOTA_ALL_VAR.tiling_dir,os.path.basename(img)+'_tile_%d_%d' % (row, col))+Path(img).suffix  ,
                                image2[y0:y1, x0:x1])

    def algorithm(iAngle):
        rotateI = imutils.rotate_bound(gray_image, iAngle)
        glcm = graycomatrix(rotateI,
                            distances=distances,
                            angles=[0],
                            symmetric=False,
                            normed=False)[noise_red_val:, noise_red_val:, :, :]

        correlation = graycoprops(glcm, 'correlation')
        df = pd.DataFrame(correlation)
        df2[iAngle] = df
        asm = graycoprops(glcm[:, :, 0:1, :], 'ASM').mean()
        homogeneity = graycoprops(glcm[:, :, 0:1, :], 'homogeneity').mean()


    # List files:
    if SOTA_ALL_X.segments == 1:
        files = glob.glob(os.path.join(SOTA_ALL_X.inx, ALL_FORMAT_STR))+glob.glob(os.path.join(SOTA_ALL_X.tiling_dir, ALL_FORMAT_STR))
    else:
        files = glob.glob(os.path.join(SOTA_ALL_X.inx, ALL_FORMAT_STR))

    # Analysis GLCM and sarcomere length, loop over folder
    pbar = tqdm(files)
    for img in pbar:
        pbar.set_description('[d][decade.tw][files]%s' % img)

        image = cv2.imread(img)
        # image_ID = '/' + img[folderLen:].replace('.tif', '').replace('\\', '').replace('/segments', '')
        image_ID = Path(img).name.split('.')[0]
        print('image_ID',image_ID)
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Background subtraction
        if SOTA_ALL_X.background == 1:
            background = restoration.rolling_ball(gray_image, radius=int(ballsize_val))
            gray_image = gray_image - background

        # prepare dataframes for loop
        df2 = pd.DataFrame(index=distances2, columns=angles)
        df2 = df2.astype(numpy.float32)

        # multithread function of GLCM and save df2 to .csv
        Parallel(n_jobs=num_cores, prefer="threads")(delayed(algorithm)(iAngle) for iAngle in angles)

        df2.to_csv(os.path.join(SOTA_ALL_X.outx,image_ID + '_corr' + ".csv"))

        # Peak detection in and amplitude calculation in all curves
        # maximum sarcomere length taken into account here
        peaks = []
        for column in df2:
            ser = pd.Series(df2[column][:max_length_val])
            indices = find_peaks(ser)[0]
            flag = not numpy.any(indices)
            if flag:
                indices = numpy.array([1, 1])
            peak = pd.Series(ser[indices[0]] - min(ser[0:indices[0]]))
            peaks.append(peak)

        peak2 = {'angle': pd.Series(range(1, 181)), 'SOS': [i[0] for i in peaks]}
        peaklist = pd.DataFrame(peak2)
        SOS_max = peaklist.iloc[peaklist.SOS.argmax()]

        # So now we have the angle and SOS of the highest curve. Now we need to extract the sarcomere length from df2
        # using the splined data
        max_curve = pd.Series(df2[SOS_max[0]])
        y = numpy.array(max_curve.values.tolist())
        f = CubicSpline(x, y, bc_type='natural')
        y_new = f(x_new)
        scaled_maxcurve = pd.DataFrame(pd.Series(x_new), columns=['Offset'])
        scaled_maxcurve['Correlation'] = y_new.tolist()
        if SOTA_ALL_X.output_Interpolated_data == 1:
            scaled_maxcurve.to_csv(SOTA_ALL_X.outx + image_ID + 'int' + ".csv")

        peak_s_length = find_peaks(y_new)[0]
        flag = not numpy.any(peak_s_length)
        if flag:  # these parameters should be 0 if there are no peaks in the splined graph
            s_length = 'NA'
            angle_val = 'NA'
            SOS = 'NA'
        else:
            s_length = round(scaled_maxcurve.iloc[peak_s_length[0]][0], 3)
            angle_val = int(SOS_max[0])
            SOS = SOS_max[1]

        # Sure, just calculate the Coefficient of Variation real quick
        CoV_offset = find_peaks(numpy.array(df2[SOS_max[0]]))
        if not numpy.any(CoV_offset[0]):
            CoV = 'NA'
            CoV_offset = numpy.array([[0.0], [0]], dtype=numpy.int64)
        else:
            CoV = cv(df2.iloc[[CoV_offset[0][0] + 1]].squeeze()[1:])

        # Create epic graph which took way too long to design, fml
        # Melt df, order hues on CoV-offset in a list, choose palette, plot all lines with seaborn
        if SOTA_ALL_X.skip_graph_save_time == 0:
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

            fig.savefig(os.path.join(SOTA_ALL_X.outx , image_ID + '_output' + '.tif'))

        # Create new GLCM with furthest pixel offset for ASM and Homogeneity
        glcm = graycomatrix(gray_image,
                            distances=[max(distances2)],
                            angles=[0],
                            symmetric=False,
                            normed=False)[noise_red_val:, noise_red_val:, :, :]
        asm = graycoprops(glcm[:, :, 0:1, :], 'ASM').mean()
        homogeneity = graycoprops(glcm[:, :, 0:1, :], 'homogeneity').mean()

        ### Compile useful output in summary excel file
        data = [
            [ Path(img).name, s_length, angle_val, SOS, CoV,
             asm, homogeneity]]
        final = pd.DataFrame(data, columns=['Name', 'Sarcomere length', 'Angle', 'Sarcomere Organization Score',
                                            'Alignment index', 'Uniformity', 'Homogeneity'])

        Summary = Summary._append(final)

        Summary.to_csv(os.path.join(SOTA_ALL_X.outx , Path(img).name + "_Summary" +  ".csv"))

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
            print(datetime.datetime.now(),"[O][ionis][AI-Model-Level=medium][InputFolder][monitoring..]",fNameX.input['pathStrX'])
        time.sleep(poll_timeout)

def thread_safe_predict(_yolo_model, _image_path):
    imgNameFolder=fNameX.output['pathObjX'].joinpath(Path(_image_path).stem)

    if (os.path.exists(imgNameFolder)):
        shutil.rmtree(imgNameFolder.absolute())
    for which_class in range(len(_yolo_model.names)):
        confX=0.1
        # which_class=0

        yolo_results=[]
        while len(yolo_results)==0 and confX > 0 :
            print('[][start-predict][using conf]=', confX, _yolo_model.names)
            yolo_results = _yolo_model.predict(_image_path, classes=[which_class], conf=confX)
            confX-=0.05
            if len(yolo_results)>0 :
                print('[AI][FOUND!!][result count]=', len(yolo_results), yolo_results)
                break
        classFolder = imgNameFolder.joinpath(_yolo_model.names[which_class])
        classResultName = imgNameFolder.joinpath(_yolo_model.names[which_class])
        # cropFolder = classFolder.joinpath('crop')
        cropFolder = classFolder
        cropFolder.mkdir(mode=0o777, parents=True, exist_ok=True)
        isoFolder = classFolder.joinpath('iso')
        isoFolder.mkdir(mode=0o777, parents=True, exist_ok=True)



        for result_index in range(len(yolo_results)):
            yolo_results[result_index].save(filename=classFolder.joinpath(
                Path(_image_path).name + '.AI.' + str(result_index) + Path(_image_path).suffix))
            yolo_results[result_index].save_crop(save_dir=cropFolder)
            if cropFolder.joinpath(_yolo_model.names[which_class]).exists():
                os.rename(cropFolder.joinpath(_yolo_model.names[which_class]),cropFolder.joinpath('crop'))

            # boxes = result.boxes  # Boxes object for bounding box outputs
            masks = yolo_results[result_index].masks  # Masks object for segmentation masks outputs
            # keypoints = result.keypoints  # Keypoints object for pose outputs
            # probs = result.probs  # Probs object for classification outputs
            # obb = result.obb  # Oriented boxes object for OBB outputs
            # result.show()  # display to screen
            print('[AI][FOUND!!][result masks]=', masks)
            if masks is not None:
                for index in range(len(masks)):
                    img = numpy.copy(yolo_results[result_index].orig_img)
                    b_mask = numpy.zeros(img.shape[:2], numpy.uint8)
                    contour = masks[index].xy[0].astype(numpy.int32).reshape(-1, 1, 2)

                    cv2.drawContours(b_mask, [contour], -1, (255, 255, 255), cv2.FILLED)
                    mask3ch = cv2.cvtColor(b_mask, cv2.COLOR_GRAY2BGR)
                    isolated = cv2.bitwise_and(mask3ch, img)
                    # crop_img = img[y:y + h, x:x + w]
                    save_path_iso= isoFolder.joinpath('iso.' + str(index) + Path(_image_path).suffix)

                    print('[][][savePath]',save_path_iso)
                    cv2.imwrite(save_path_iso, isolated)
    Path(_image_path).rename(fNameX.processed['pathObjX'] / Path(_image_path).name)


def yolo_decade(raw=None,imagePath=None,allImages=None):
    resultFinal=[]
    # yolo_results=yolo_model(imagePath,  classes=[2,3])
    if allImages is None:
        # yolo_results = yolo_model(imagePath,classes=0)
        threadX=threading.Thread(target=thread_safe_predict, args=(yolo_model, imagePath))
        threadX.start()
        threadX.join()
        # run_sota(fNameX.output['pathStrX'],fNameX.sota['pathStrX'])
        SOTA_ALL_VAR.voxelvalue=1.1
        LIST_SOTA()
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