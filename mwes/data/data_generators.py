#%%
import pandas as pd
import numpy as np
import json
from src.dataprep.WriteDfToJsonVar import WriteDfToJsonVar

#%%
# Create data for arrow in mwe_path.html
df = pd.DataFrame({'x':[100,900,1000,1000], 'y':[100,900,900,300]})
WriteDfToJsonVar(df,'mwes/data/path_data_pathmwe.json',"sepx")

#%%
# Create data for arrow in mwe_plot.html

# Common x axis
df = pd.DataFrame({'x':range(1,9),'y1':[2,4,4,4,4,8,4,4], 'y2':[1,2,2,3,3,2,2,1]})
WriteDfToJsonVar(df,'mwes/data/path_data_plotmwe.json',"comx")

## Separate x axes
#df = pd.DataFrame({'x1':range(1,9),'y1':[2,4,4,4,4,8,4,4],'x2':range(8), 'y2':[1,2,2,3,3,2,2,1]})
#df = df[['x1','y1','x2','y2']]
#WriteDfToJsonVar(df,'mwes/data/path_data_plotmwe.json',"sepx")

