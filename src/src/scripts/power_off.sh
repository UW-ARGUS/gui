# Script to power off the device
DEVICE_IP="192.168.194.151"

echo "sshing into the device" 

# ssh into the device and restart the argus service
ssh argus@"$DEVICE_IP" << 'EOF'
    # Power-off the device
    sudo poweroff
EOF

echo "Power-off A.R.G.U.S. on device $DEVICE_IP"