#%%
import os
os.chdir("../../")
import pandas as pd
import numpy as np
import json
from src.dataprep.WriteDfToJsonVar import WriteDfToJsonVar, WriteScatter

#%%
# Create data for arrow in mwe_path.html
df = pd.DataFrame({'x':[100,900,1000,1000], 'y':[100,900,900,300]})
WriteDfToJsonVar(df,'mwes/data/path_data_pathmwe.json',"sepx")

#%%
# Create data for lines in mwe_plot, with separate axes
df = pd.DataFrame({'x1':range(1,9),   'y1' : [2,4,4,4,4,8,4,4],
                   'x2':range(4,12),  'y2' : [1,2,2,3,3,2,2,1],
                   'x3':range(8,16),  'y3' : [4,7,4,5,4,2,2,1],
})
WriteDfToJsonVar(df,'mwes/data/path_data_plotmwe.json',"sepx")

#%%
# Create time series data for line chart in mwe_plot
dates1 = ['2007-01-01', '2007-04-01', '2007-07-01', '2007-10-01', '2008-01-01']
dates2 = ['2007-01-01', '2008-01-01', '2009-01-01', '2010-01-01', '2011-01-01']
df = pd.DataFrame(
    data={
        'ts1':[100, 120, 110, 80, 115],
        'ts2':[100, 120, 130, 140, 125],
        'dates1':pd.to_datetime(dates1),
        'dates2':pd.to_datetime(dates2),
    }
)
df['dates2'] = df['dates2'].dt.strftime('%Y-%m-%d')
df = df[["dates1", "ts1", "dates2", "ts2"]]
WriteDfToJsonVar(df, 'mwes/data/tsdata_plotmwe.json',"sepx", varname="tsData")
# %%
# Write normal scatter data for mwe_plot
df = pd.DataFrame(
    data={
        "x":np.random.randint(low=-1100, high=1100, size=10),
        "y":np.random.randint(low=0, high=20, size=10),
    }
)
df["color"] = "#F09B0C"
df["r"] = 5
WriteScatter(
    df,
    path='mwes/data/scatterdata1_plotmwe.json',
    varname="scatter_data1",
    x="x",
    y="y",
)

# %%
# Write time series scatter data for mwe_plot
dates = ['2007-01-01', '2008-01-01', '2009-01-01', '2010-01-01', '2011-01-01']
df = pd.DataFrame(
    data={
        "x":pd.to_datetime(dates),
        "y":[120, 115, 130, 140, 100],
    }
)
df["color"] = "#F09B0C"
df["r"] = 10
WriteScatter(
    df,
    path='mwes/data/scatterdata2_plotmwe.json',
    varname="scatter_data2",
    x="x",
    y="y",
)
# %%
