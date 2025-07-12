from enum import Enum

# Copyright © Jeroen Stein, <steinjeroen@mgmail.com>
# Leiden University Medical Center, 2022
# This work is free. You can redistribute it and/or modify it under the
# terms of the Do What The Fuck You Want To Public License, Version 2,
# as published by Sam Hocevar. See http://www.wtfpl.net/ for more details.
# modify for using ai model auto analusis . See http://decade.tw for more details.
# rest of the libraries


class SOTA_ALL_X():
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

def run_sota(inx,outx):
    matplotlib.use("Agg")
    warnings.filterwarnings("ignore")  # I know, I know..
    num_cores = multiprocessing.cpu_count()

    # CoV-formula, input from user translations and output folder creation
    cv = lambda x: np.std(x, ddof=1) / np.mean(x) * 100
    input_dir = inx
    output_dir = outx
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

    print('[][][]prompt',prompt)
    x = np.arange(1, prompt, 1)
    x = x * (1 / voxel)
    max_x=prompt* (1 / voxel)
    x_new = np.linspace((1 / voxel), max_x, prompt * 100)
    print('[][][0]x_new', x_new)
    distances = [*range(1, prompt, 1)]
    distances2 = [*range(0, prompt - 1, 1)]
    angles = [*range(1, 181, 1)]
    print('[][][]distances', distances)
    print('[][][]distances2', distances2)
    print('[][][]angles', angles)
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
        asm = greycoprops(glcm[:, :, 0:1, :], 'ASM').mean()
        homogeneity = greycoprops(glcm[:, :, 0:1, :], 'homogeneity').mean()


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

        print('[][][]x_new', x_new)
        print('[][][]x_new', x_new)
        print('[][][]x_new', x_new)

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


