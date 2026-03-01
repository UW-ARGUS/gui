#!/bin/bash

echo "Stopping mapping processes..."

# Stop main mapping program
if pkill -f "python.*src/main.py"; then
    echo "main.py stopped"
else
    echo "main.py was not running"
fi

# Stop listener program
if pkill -f "python.*listen_to_pi.py"; then
    echo "listen_to_pi.py stopped"
else
    echo "listen_to_pi.py was not running"
fi

echo "All mapping processes stopped."