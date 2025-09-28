import serial
import serial.tools.list_ports
import sys
import json
from llama_cpp import Llama
import os
import json_repair

BAUDRATE = 115200
TIMEOUT = 120
SER = None

def find_pico_data_port():
    """
    Finds the specific Pico CDC 'data' port by checking its description.
    """
    # Pico's Vendor ID and Product ID
    PICO_VID = 0x239A
    PICO_PID = 0x80F4
    DATA_PORT_KEYWORD = "Data"

    ports = serial.tools.list_ports.comports()
    pico_ports = [p for p in ports if p.vid == PICO_VID and p.pid == PICO_PID]

    if not pico_ports:
        return None  # No Pico found

    if len(pico_ports) == 1:
        return pico_ports[0].device # Only one port, so return it

    # Multiple ports found, look for the data port
    for port in pico_ports:
        if DATA_PORT_KEYWORD in port.description:
            return port.device
            
    # Fallback: if no description matches, assume the last port is the data port
    pico_ports.sort(key=lambda p: p.device)
    return pico_ports[-1].device

def connect():
    """
    Connect to the Pico's data port after automatically detecting it.
    """
    global SER
    
    pico_port = find_pico_data_port()

    if not pico_port:
        print("Error: Could not find the Pico data port. Is it connected?")
        sys.exit(1)

    try:
        SER = serial.Serial(pico_port, BAUDRATE, timeout=TIMEOUT)
        print(f"Successfully connected to Pico on {pico_port}")
    except serial.SerialException as e:
        print(f"Failed to connect to Pico on {pico_port}: {e}")
        sys.exit(1)

def send_command(command, payload={}) :
    """Send a command to the Pico and wait for a response."""

    try :
        full_command = f"{command}:{json.dumps(payload)}\n"
        SER.write(full_command.encode("utf-8"))

        if command == "disconnect_usb" :
            return "OK"

        response = SER.readline().decode("utf-8").strip()
        if response.startswith(f"{command}:") :
            response_payload = response[len(f"{command}:"):]
            return json.loads(response_payload)
        
    except Exception as e :
        print(f"Error: {e}")

def send_ack() :
    """Send an acknowledgment to the Pico."""
    SER.write(b"OK\n")

def is_wallet_exists():
    """Check if a wallet exists on the Pico."""
    res = send_command("is_wallet_exists")
    return res

def init_wallet(pin, name, new_wallet=False):
    """Initialize a new wallet or access an existing one."""
    command = {
        "pin": pin,
        "name": name,
        "new_wallet": new_wallet
    }
    res = send_command("init_wallet", command)
    return res

def get_wallet_name():
    """Retrieve the name of the wallet."""
    res = send_command("get_wallet_name")
    return res

def get_public_key(role="USER"):
    """Retrieve the public key for the specified role."""
    command = {
        "role": role
    }
    res = send_command("get_public_key", command)
    return res

def sign_personal_message(pin, message, role="USER", transaction_id=None):
    """Sign a personal message."""
    command = {
        "pin": pin,
        "message": message,
        "role": role,
        "transaction_id": transaction_id
    }
    res = send_command("sign_personal_message", command)
    return res

def sign_typed_data(pin, domain, types, primary_type, message, role="USER", transaction_id=None):
    """Sign typed data."""
    command = {
        "pin": pin,
        "domain": domain,
        "types": types,
        "primary_type": primary_type,
        "message": message,
        "role": role,
        "transaction_id": transaction_id
    }
    res = send_command("sign_typed_data", command)
    return res

def confirm_transaction(pin, transaction_id, transaction_hash, nonce):
    """Confirm a transaction."""
    command = {
        "pin": pin,
        "transaction_id": transaction_id,
        "transaction_hash": transaction_hash,
        "nonce": nonce
    }
    res = send_command("confirm_transaction", command)
    return res

def fail_transaction(transaction_id):
    """Fail a transaction."""
    command = {
        "transaction_id": transaction_id
    }
    res = send_command("fail_transaction", command)
    return res

def get_transaction(transaction_id):
    """Retrieve transaction details."""
    command = {
        "transaction_id": transaction_id
    }
    res = send_command("get_transaction", command)
    return res

def get_all_transactions():
    """Retrieve all transactions."""
    res = send_command("get_all_transactions")
    return res

def get_file(filename, file_save_location="/root"):
    """Request a file from the Pico device."""
    
    command = filename

    res = send_command("get_file", command)
    if not res.startswith("SIZE:"):
        print("Failed to get file size.")
        return

    file_size = int(res[len("SIZE:"):])
    print(f"File size: {file_size} bytes")

    # Send acknowledgment to start file transfer
    send_ack()

    bytes_received = 0
    chunk_size = 1024

    with open(f"{file_save_location}/{filename}", "wb") as f :
        while bytes_received < file_size :
            chunk = SER.read(min(chunk_size, file_size - bytes_received))
            if not chunk :
                break
            f.write(chunk)
            bytes_received += len(chunk)

    if bytes_received != file_size :
        return {
            "error": f"File transfer incomplete. Expected {file_size}, got {bytes_received}"
        }
    else :
        return {
            "success": f"File {filename} received successfully and saved to {file_save_location}/{filename}"
        }
    
def generate_response(model_path, system_prompt, user_prompt, is_chat=False):

    #loading the model
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
    try:
        llm = Llama(
            model_path=model_path,
            n_ctx=32768,       # The max sequence length to use - context window
            # n_threads=8,      # The number of CPU threads to use, tailor to your system
            # n_gpu_layers=-1,   # The number of layers to offload to GPU, if you have GPU support
            
        )
    except Exception as e:
        print(f"Error loading model: {e}")
        print("\nPlease ensure that you have replaced 'path/to/your/model.gguf' with the correct path to your GGUF model file.")
        exit()

    if not system_prompt :
        system_prompt = send_command("get_system_prompt")["system_prompt"]


    messages=[
        {'role':'system', 'content': system_prompt},
        {'role':'user', 'content': user_prompt}
    ]

    #generating response
    try:
        output=llm.create_chat_completion(
            messages=messages,
            max_tokens=512
        )

        generated_text = output['choices'][0]['message']['content'].strip()
        print(f"Generated Text: {generated_text}")

        if is_chat:
            return generated_text
        else:
            repaired_obj = json_repair.loads(generated_text)
            if not isinstance(repaired_obj, dict) or 'decision' not in repaired_obj:
                return {
                    "decision": False,
                    "error": "Repaired JSON does not contain 'decision' key."
                }
            return repaired_obj

    except Exception as e:
        print(f"Error during response generation: {e}")

def disconnect_usb() :
    """Disconnect from the Pico device."""
    send_command("disconnect_usb")

    if SER and SER.is_open :
        SER.close()
        print("Disconnected from Pico.")