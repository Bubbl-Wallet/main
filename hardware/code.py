import signing
import logger
from file_transfer import get_file

import board, busio, digitalio, sdcardio, storage, sys, time, traceback, usb_cdc
import os
import json

import usb_hid
from adafruit_hid.keyboard import Keyboard
from adafruit_hid.keycode import Keycode
from adafruit_hid.keyboard_layout_us import KeyboardLayoutUS

def open_wallet(LOGGER) :
    try :
        time.sleep(1)
        keyboard = Keyboard(usb_hid.devices)
        layout = KeyboardLayoutUS(keyboard)

        keyboard.press(Keycode.GUI, Keycode.R)
        keyboard.release_all()
        keyboard.press(Keycode.COMMAND, Keycode.SPACE)
        keyboard.release_all()

        time.sleep(0.5)

        layout.write("bubbl://start\n")

    except Exception as e:
        LOGGER.log(f"Failed to open wallet: {e}")

if __name__ == "__main__":

    data_serial = usb_cdc.data
    Logger = logger.Logger()

    sck, si, so, cs = board.GP10, board.GP11, board.GP12, board.GP13
    spi = busio.SPI(sck, si, so)

    sdcard = sdcardio.SDCard(spi, cs)
    vfs = storage.VfsFat(sdcard)
    storage.mount(vfs, "/sd")

    signing.set_is_pico(True)
    Logger.set_is_pico(True)

    open_wallet(Logger)

    led = digitalio.DigitalInOut(board.LED)
    led.direction = digitalio.Direction.OUTPUT

    while True :
        try :
            led.value = not led.value
            time.sleep(0.5)

            if data_serial.in_waiting > 0 :
                command = data_serial.readline().decode().strip()

                if command.startswith("is_wallet_exists:") :
                    led.value = True

                    exists = signing.is_wallet_exists()
                    res_data = json.dumps({"exists": exists})
                    data_serial.write(f"is_wallet_exists:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("init_wallet:") :
                    led.value = True

                    payload = command[len("init_wallet:"):]
                    payload: dict = json.loads(payload)

                    pin = payload.get("pin")
                    name = payload.get("name")
                    new_wallet = payload.get("new_wallet", False)

                    res = signing.init_wallet(pin, name, new_wallet)

                    res_data = json.dumps(res)
                    data_serial.write(f"init_wallet:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("get_wallet_name:") :
                    led.value = True

                    wallet_name = signing.get_wallet_name()
                    res_data = json.dumps(wallet_name)
                    data_serial.write(f"get_wallet_name:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("get_public_key:") :
                    led.value = True

                    payload = command[len("get_public_key:"):]
                    payload: dict = json.loads(payload)

                    role = payload.get("role", "USER")
                    res = signing.get_public_key(role)

                    res_data = json.dumps(res)
                    data_serial.write(f"get_public_key:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("sign_personal_message:") :
                    led.value = True

                    payload = command[len("sign_personal_message:"):]
                    payload: dict = json.loads(payload)

                    pin = payload.get("pin")
                    message = payload.get("message")
                    role = payload.get("role", "USER")
                    transaction_id = payload.get("transaction_id", None)

                    res = signing.sign_personal_message(pin, message, role, transaction_id)
                    res_data = json.dumps(res)
                    data_serial.write(f"sign_personal_message:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("sign_typed_data:") :
                    led.value = True

                    payload = command[len("sign_typed_data:"):]
                    payload: dict = json.loads(payload)

                    pin = payload.get("pin")
                    domain = payload.get("domain")
                    types = payload.get("types")
                    primary_type = payload.get("primary_type")
                    message = payload.get("message")
                    role = payload.get("role", "USER")
                    transaction_id = payload.get("transaction_id", None)

                    res = signing.sign_typed_data(pin, domain, types, primary_type, message, role, transaction_id)
                    res_data = json.dumps(res)
                    data_serial.write(f"sign_typed_data:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("confirm_transaction:") :
                    led.value = True

                    payload = command[len("confirm_transaction:"):]
                    payload: dict = json.loads(payload)

                    pin = payload.get("pin")
                    transaction_id = payload.get("transaction_id")
                    transaction_hash = payload.get("transaction_hash")
                    nonce = payload.get("nonce")

                    res = signing.confirm_transaction(pin, transaction_id, transaction_hash, nonce)
                    res_data = json.dumps(res)
                    data_serial.write(f"confirm_transaction:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("fail_transaction:") :
                    led.value = True

                    payload = command[len("fail_transaction:"):]
                    payload: dict = json.loads(payload)

                    transaction_id = payload.get("transaction_id")

                    res = signing.fail_transaction(transaction_id)
                    res_data = json.dumps(res)
                    data_serial.write(f"fail_transaction:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("get_transaction:") :
                    led.value = True

                    payload = command[len("get_transaction:"):]
                    payload: dict = json.loads(payload)

                    transaction_id = payload.get("transaction_id")

                    res = signing.get_transaction(transaction_id)
                    res_data = json.dumps(res)
                    data_serial.write(f"get_transaction:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("get_all_transactions") :
                    led.value = True

                    res = signing.get_all_transactions()
                    res_data = json.dumps(res)
                    data_serial.write(f"get_all_transactions:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("get_file:") :
                    led.value = True

                    payload = command[len("get_file:"):]
                    filename = json.loads(payload)
                    get_file(filename, data_serial)

                    data_serial.write(f"get_file:{json.dumps("Done")}\n".encode())

                    led.value = False

                elif command.startswith("get_system_prompt") :
                    led.value = True

                    with open("/sd/system_prompt.txt", "r") as f :
                        prompt = f.read()
                        prompt = {
                            "system_prompt": prompt
                        }
                    res_data = json.dumps(prompt)
                    data_serial.write(f"get_system_prompt:{res_data}\n".encode())

                    led.value = False

                elif command.startswith("disconnect_usb") :
                    break
        
        except Exception as e:
            for _ in range(10) :
                led.value = not led.value
                time.sleep(0.2)
            Logger.log(f"An error occured: {e}")

    storage.umount("/sd")