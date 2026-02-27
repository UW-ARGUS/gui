echo "start mapping clicked" 
cd ~/ARGUS-workspace/mapping

echo $PWD
source .venv/bin/activate
python src/main.py

cd ..

echo "run main.py mapping" 
python listen_to_pi.py
echo "done" 