#%%
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
np.random.seed(1)

#%%
def PlotVertical(dff,xlim=None,ylim=None, redcolors=[]):
    
    fig = plt.figure(figsize=(15,7))
    ax = fig.add_subplot(111)
    for ind in range(len(dff.columns)):
        x = dff.index.values
        y = dff.iloc[:,ind].values
        if ind in redcolors:
            ax.plot(x,y,c="red")
        else:
            ax.plot(x,y,c="steelblue")        

        # Flip
        newx = ax.lines[ind].get_ydata()
        newy = ax.lines[ind].get_xdata()
        ax.lines[ind].set_xdata(newx)
        ax.lines[ind].set_ydata(newy)

    # Set new lims
    if xlim == None:
        gg = np.maximum(np.abs(df.values.min()),np.abs(df.values.max()))
        xlim = [-gg - 5, gg + 5]
    if ylim == None:
        ylim = [dff.index[0],dff.index[-1] + 5]
    ax.set_xlim(xlim)
    ax.set_ylim(ylim)

def PolyaProcess(nrow,ncol):
    arr = np.empty(shape=(nrow,ncol),dtype = int)
    for col in range(ncol):
        mylist = [-1,1]
        p_1 = 0.5    
        for ind in range(nrow):
            rand = np.random.choice([-1,1], p=[1-p_1,p_1])
            mylist.append(rand)
            arr[ind,col] = rand
            p_1 = mylist.count(1) / len(mylist)
    return pd.DataFrame(arr.cumsum(axis=0))

#%% [markdown]
# ## Random walk

#%%
df = pd.DataFrame(np.random.choice([-1,1], size=(50,100)).cumsum(axis=0))
PlotVertical(dff=df, xlim=[-60,60], redcolors=[99])

#%% [markdown]
# ## Polya process

#%%
df = PolyaProcess(nrow=3,ncol=2)
PlotVertical(dff=df, xlim=[-60,60], redcolors=[99])

#%%
df.iloc[:,0:2].to_json()

#%%
