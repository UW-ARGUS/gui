#!/bin/bash

echo "Stopping mapping processes..."

# Stop main mapping program
pkill -f "python src/main.py"

# Stop listener program
pkill -f "python listen_to_pi.py"

echo "All mapping processes stopped."