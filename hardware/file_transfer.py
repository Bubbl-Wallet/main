import os
import logger
import json

CHUNK_SIZE = 64
Logger = logger.Logger()
Logger.set_is_pico(True)

def get_file(filename, data_serial):
    """Send a file to the connected PC over the DATA serial port."""

    try:
        filename = "/sd/" + filename
        filesize = os.stat(filename)[6]
        Logger.log(f"File found. Size: {filesize} bytes.")

        size_payload = json.dumps(f"SIZE:{filesize}")
        data_serial.write(f"get_file:{size_payload}\n".encode())

        ack = data_serial.readline().decode().strip()
        if ack == "OK":
            Logger.log("PC is ready. Starting raw transfer...")

            with open(filename, "rb") as f:
                while True:
                    chunk = f.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    data_serial.write(chunk)

            Logger.log("File transfer complete.")
    except Exception as e:
        Logger.log(f"An error occurred during file transfer: {e}")