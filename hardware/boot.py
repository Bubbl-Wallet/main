import usb_cdc

# --- Enable the second, raw data serial port ---
usb_cdc.enable(data=True, console=True)