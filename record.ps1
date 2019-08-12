#####################################################
# PS script for running recordings.
#
# If script cannot be run, try Set-ExecutionPolicy RemoteSigned
#
#####################################################

#####################################################
# Options needed to specify by user
#####################################################
$pathToAnimLib        = "my_first_path/animlib"
$pathToVids           = "my_second_path/folder_for_vids"
$pathToPuppeteer      = "my_third_path/node_modules/puppeteer"
$seconds              = 1
$projectPathLocalHost = "http://localhost:8000/mwes/mwe_force.html" # localhost source set up in folder animlib
$outputVidName        = "test.mp4"

#####################################################
# Code
#####################################################

# cd to folder animlib
Set-Location $pathToAnimLib

$pathToRecrodjs  = "src/recording/record.js"

# Delete pre-existing pngs in png folder
Remove-Item –path png/* -include *.png

# Run recording
# args: seconds, path/to/png/folder/, path/to/localhost/page.html, path/to/node_modules/puppeteer
node $pathToRecrodjs $seconds png/ $projectPathLocalHost $pathToPuppeteer

# Convert to video (overrides existing)
ffmpeg -y -framerate 60 -i png/%05d.png -pix_fmt yuv420p $pathToVids/$outputVidName

# Delete pngs
Remove-Item –path png/* -include *.png
