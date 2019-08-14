def WriteDfToJsonVar(dff,path,orientation,varname="lineDataObject"):
        """
        Turn pandas data frame to variable for animlib path data object.
        Accepts data frames with following structure:
        - N + 1 columns: (x1,y1,...,yN) -> orientation="comx"        
        - N * 2 columns: (x1,y1),..., (xN,YN) -> orientation="sepx"
        Columns need to be in order. Index is not to be used for storing values.

        Writes named json object 
                varname = {"series1": [[x,y]...,[x,y]], ..., "seriesN": [[x,y]...,[x,y]]}
        that can be directly used as animlib path data object.
        """
        import pandas as pd
        class MyException(Exception):
                pass
        json = '{'        
        if orientation == 'sepx':
                for colpairno in range(int(len(dff.columns)/2)):
                        colloc = colpairno * 2
                        df_p = dff.iloc[:,colloc:colloc+2].copy()
                        seriesname = df_p.columns[1]
                        json_p = df_p.to_json(orient="values")
                        if colpairno != len(dff.columns)/2-1:
                                json = json + '"'+seriesname+'":' + json_p + ', '
                        else:
                                json = json + '"'+seriesname+'":' + json_p + '}'
        
        if orientation == 'comx':
                for colloc in range(1,len(dff.columns)):
                        df_p = dff.iloc[:,[colloc]].copy()
                        seriesname = df_p.columns[0]
                        df_p['x'] =  dff.iloc[:,0].copy()
                        df_p = df_p[['x',seriesname]]
                        json_p = df_p.to_json(orient="values")

                        if colloc != len(dff.columns)-1:
                                json = json + '"'+seriesname+'":' + json_p + ', '
                        else:
                                json = json + '"'+seriesname+'":' + json_p + '}'                        
        
        json = "let " + varname + " = " + json
        with open(path, 'w') as outfile:
                outfile.write(json)