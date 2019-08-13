#%%
import pandas as pd
import numpy as np
import json

#%%
# Create data for arrow in mwe_path.html
# This is an example of exporting simple x and y columned data frame

df = pd.DataFrame({'x':[100,900,1000,1000], 'y':[100,900,900,300]})
myjson = df.to_json(orient="split")
myjson = "let myLineData = " + myjson
with open('mwes/data/path_data_example.json', 'w') as outfile:
    outfile.write(myjson)

#%%

# TO BE: Example of multi-seried data frame with same x values
#[[1,2],[2,4],[3,4],[4,4],[5,4],[6,8],[7,4],[8,4]]