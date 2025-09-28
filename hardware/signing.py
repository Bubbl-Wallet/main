"""
Complete Ethereum Key Signing on Raspberry Pi Pico (CircuitPython)
- Supports personal message signing (ERC-191)
- Supports enhanced EIP-712 typed data signing with proper type handling
- Uses keccak module for Keccak256 hashing
- Improved memory management and error handling
"""

import random
import keccak
import binascii
import logger
import os
import circuitpython_uuid4 as uuid
import circuitpython_hmac as hmac


from db import PicoDB

PRIVATE_KEY_FILE = "private_key.txt"
PUBLIC_KEY_FILE = "public_key.txt"
PIN_FILE = "pin.txt"
NAME_FILE = "name.txt"

# secp256k1 curve parameters
P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
GX = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
GY = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8

IS_PICO = True

Logger = logger.Logger()
DB = PicoDB()

def safe_mod(a, m):
    """Safe modulo operation to prevent overflow"""
    if a < 0:
        # Handle negative numbers carefully
        return (a % m + m) % m
    return a % m

def mod_inverse(a, m):
    """Extended Euclidean Algorithm for modular inverse with overflow protection"""
    a = safe_mod(a, m)
    if a == 0:
        raise Exception('Modular inverse does not exist')
    
    # Use iterative approach instead of recursive
    old_r, r = a, m
    old_s, s = 1, 0
    
    while r != 0:
        quotient = old_r // r
        old_r, r = r, old_r - quotient * r
        old_s, s = s, old_s - quotient * s
    
    if old_r > 1:
        raise Exception('Modular inverse does not exist')
    
    return safe_mod(old_s, m)

def point_double(px, py):
    """Double a point on secp256k1 with safe arithmetic"""
    if py == 0:
        return None, None
    
    # Calculate 3 * px * px carefully
    px_squared = safe_mod(px * px, P)
    three_px_squared = safe_mod(3 * px_squared, P)
    two_py = safe_mod(2 * py, P)
    
    s = safe_mod(three_px_squared * mod_inverse(two_py, P), P)
    s_squared = safe_mod(s * s, P)
    two_px = safe_mod(2 * px, P)
    
    rx = safe_mod(s_squared - two_px, P)
    ry = safe_mod(s * safe_mod(px - rx, P) - py, P)
    
    return rx, ry

def point_add(px, py, qx, qy):
    """Add two points on secp256k1 with safe arithmetic"""
    if px is None:
        return qx, qy
    if qx is None:
        return px, py
    
    if px == qx:
        if py == qy:
            return point_double(px, py)
        else:
            return None, None
    
    # Calculate slope safely
    dy = safe_mod(qy - py, P)
    dx = safe_mod(qx - px, P)
    dx_inv = mod_inverse(dx, P)
    s = safe_mod(dy * dx_inv, P)
    
    # Calculate result point
    s_squared = safe_mod(s * s, P)
    rx = safe_mod(s_squared - px - qx, P)
    ry = safe_mod(s * safe_mod(px - rx, P) - py, P)
    
    return rx, ry

def scalar_mult(k, px, py):
    """Multiply point by scalar using binary method with safe arithmetic"""
    if k == 0:
        return None, None
    if k == 1:
        return px, py
    
    # Ensure k is positive and in range
    k = safe_mod(k, N)
    if k == 0:
        return None, None
    
    rx, ry = None, None
    addx, addy = px, py
    
    while k > 0:
        if k & 1:
            rx, ry = point_add(rx, ry, addx, addy)
        if k > 1:  # Only double if we need to continue
            addx, addy = point_double(addx, addy)
        k >>= 1
    
    return rx, ry

def generate_rfc6979_k(private_key, message_hash, attempt=0):
    """Generate deterministic k according to RFC 6979"""
    # Convert inputs to bytes
    private_key_bytes = private_key.to_bytes(32, 'big')
    message_hash_bytes = message_hash.to_bytes(32, 'big')
    
    # Step 1: Initialize V and K
    V = b'\x01' * 32
    K = b'\x00' * 32
    
    # Step 2: K = HMAC_K(V || 0x00 || private_key || message_hash)
    K = hmac.new(K, V + b'\x00' + private_key_bytes + message_hash_bytes, digestmod='sha256').digest()
    
    # Step 3: V = HMAC_K(V)
    V = hmac.new(K, V, digestmod='sha256').digest()
    
    # Step 4: K = HMAC_K(V || 0x01 || private_key || message_hash)
    K = hmac.new(K, V + b'\x01' + private_key_bytes + message_hash_bytes, digestmod='sha256').digest()
    
    # Step 5: V = HMAC_K(V)
    V = hmac.new(K, V, digestmod='sha256').digest()
    
    # Step 6: Generate k values until we find a valid one
    for i in range(attempt + 1):
        # Generate candidate k
        T = b''
        while len(T) < 32:
            V = hmac.new(K, V, digestmod='sha256').digest()
            T += V
        
        k = int.from_bytes(T[:32], 'big')
        
        # Check if k is valid (in range [1, N-1])
        if 1 <= k < N:
            if i == attempt:
                return k
        
        # If not valid or not the attempt we want, update K and V for next iteration
        K = hmac.new(K, V + b'\x00', digestmod='sha256').digest()
        V = hmac.new(K, V, digestmod='sha256').digest()
    
    # Fallback (should not happen)
    return 1

def recover_public_key(message_hash, r, s, recovery_id):
    """Recover public key from signature"""
    try:
        # Calculate the point R from r and recovery_id
        x = r + (recovery_id // 2) * N
        
        # Calculate y coordinate (there are two possible values)
        y_squared = safe_mod(x * x * x + 7, P)  # secp256k1: y^2 = x^3 + 7
        y = pow(y_squared, (P + 1) // 4, P)  # Modular square root
        
        # Choose the correct y based on recovery_id parity
        if (y % 2) != (recovery_id % 2):
            y = P - y
        
        # Calculate inverse values for recovery
        r_inv = mod_inverse(r, N)
        e = safe_mod(message_hash, N)
        
        # Calculate the recovered public key point
        # Q = r^-1 * (s*R - e*G)
        sr_x, sr_y = scalar_mult(s, x, y)
        eg_x, eg_y = scalar_mult(e, GX, GY)
        
        # Subtract e*G from s*R (add negative of e*G)
        neg_eg_y = P - eg_y if eg_y != 0 else 0
        diff_x, diff_y = point_add(sr_x, sr_y, eg_x, neg_eg_y)
        
        # Multiply by r^-1
        pub_x, pub_y = scalar_mult(r_inv, diff_x, diff_y)
        
        return pub_x, pub_y
        
    except Exception:
        return None, None

def calculate_recovery_id(private_key, message_hash, r, s):
    """Calculate the correct recovery ID (v) for the signature"""
    # Get the actual public key
    actual_pub_x, actual_pub_y = private_to_public(private_key)
    
    # Try each recovery ID (0, 1, 2, 3)
    for recovery_id in range(4):
        recovered_pub_x, recovered_pub_y = recover_public_key(message_hash, r, s, recovery_id)
        
        if (recovered_pub_x == actual_pub_x and recovered_pub_y == actual_pub_y):
            return recovery_id
    
    # Fallback - this shouldn't happen with valid signatures
    return 0

def generate_private_key():
    """Generate a random private key with better bounds checking"""
    # Use a simpler approach for CircuitPython
    max_attempts = 10
    for _ in range(max_attempts):
        try:
            # Generate 32 random bytes
            key_bytes = bytes([random.randint(0, 255) for _ in range(32)])
            key = int.from_bytes(key_bytes, 'big')
            
            # Ensure key is in valid range [1, N-1]
            if 1 <= key < N:
                return key
                
        except Exception:
            pass
    
    # Fallback method
    return random.randint(1, min(N - 1, 0xFFFFFFFFFFFFFFFF))  # Limit to 64-bit if needed

def private_to_public(private_key):
    """Derive public key from private key"""
    return scalar_mult(private_key, GX, GY)

def hash_message(message):
    """Hash a message using Keccak256 (Ethereum standard)"""
    if isinstance(message, str):
        message = message.encode('utf-8')
    # Create a Keccak256 hash with initial input (preset accepts initial_input)
    h = keccak.Keccak256(message)
    digest = h.digest()  # bytes
    # Convert to integer safely
    return int.from_bytes(digest, 'big')

def create_ethereum_message_hash(message):
    """Create Ethereum signed message hash with prefix (ERC-191/ERC-7739)"""
    if isinstance(message, str):
        message = message.encode('utf-8')
    
    # Ethereum Signed Message prefix
    prefix = b"\x19Ethereum Signed Message:\n"
    length = str(len(message)).encode('utf-8')
    
    # Combine: prefix + length + message
    full_message = prefix + length + message
    return hash_message(full_message)

def sign_message(private_key, message_hash):
    """Sign a message hash with private key using ECDSA - optimized for CircuitPython"""
    # Ensure inputs are in valid range
    z = safe_mod(message_hash, N)
    private_key = safe_mod(private_key, N)
    
    max_attempts = 50  # Reduced from 100 to save memory
    
    for attempt in range(max_attempts):
        try:
            
            k = generate_rfc6979_k(private_key, message_hash, attempt)
            
            if k == 0:
                continue
            
            # Calculate r = (k*G).x mod n
            rx, _ = scalar_mult(k, GX, GY)
            if rx is None:
                continue
                
            r = safe_mod(rx, N)
            if r == 0:
                continue
            
            # Calculate s = k^-1 * (z + r * private_key) mod n
            # Break this into smaller operations
            r_priv = safe_mod(r * private_key, N)
            z_plus_r_priv = safe_mod(z + r_priv, N)
            
            k_inv = mod_inverse(k, N)
            s = safe_mod(k_inv * z_plus_r_priv, N)
            
            if s == 0:
                continue
            
            # Ensure s is in lower half for Ethereum compatibility
            if s > N // 2:
                s = N - s
            
            return r, s
            
        except Exception as e:
            Logger.log(f"Attempt {attempt + 1} failed: {e}")
            continue
    
    raise Exception(f"Failed to generate signature after {max_attempts} attempts")

def signMessage(private_key, message):
    """Sign a personal message using Ethereum's personal_sign format (ERC-191)"""
    # Create Ethereum message hash with prefix
    message_hash = create_ethereum_message_hash(message)
    
    # Sign the hash
    r, s = sign_message(private_key, message_hash)
    
    # Calculate recovery ID (v)
    recovery_id = calculate_recovery_id(private_key, message_hash, r, s)
    v = 27 + recovery_id
    
    return r, s, v

# Enhanced EIP-712 implementation
def encode_type(primary_type, types):
    """Encode a struct type according to EIP-712"""
    result = primary_type + "("
    
    # Get the type definition
    type_def = types.get(primary_type, [])
    
    # Add each field
    field_strings = []
    for field in type_def:
        field_strings.append(f"{field['type']} {field['name']}")
    
    result += ",".join(field_strings) + ")"
    
    # Recursively add referenced types in alphabetical order
    referenced_types = set()
    _find_dependencies(primary_type, types, referenced_types)
    referenced_types.discard(primary_type)  # Remove primary type itself
    
    # Sort referenced types alphabetically
    for ref_type in sorted(referenced_types):
        if ref_type in types:
            ref_def = types[ref_type]
            ref_fields = []
            for field in ref_def:
                ref_fields.append(f"{field['type']} {field['name']}")
            result += ref_type + "(" + ",".join(ref_fields) + ")"
    
    return result

def _find_dependencies(primary_type, types, found_types):
    """Find all type dependencies recursively"""
    if primary_type in found_types or primary_type not in types:
        return
    
    found_types.add(primary_type)
    
    # Look for custom types in the fields
    for field in types[primary_type]:
        field_type = field['type']
        
        # Handle arrays
        if field_type.endswith('[]'):
            field_type = field_type[:-2]
        
        # If it's a custom type, recurse
        if field_type in types and field_type not in found_types:
            _find_dependencies(field_type, types, found_types)

def hash_type(primary_type, types):
    """Hash a type string according to EIP-712"""
    type_string = encode_type(primary_type, types)
    return hash_message(type_string.encode('utf-8'))

def custom_ljust(data, width, fillchar=b'\x00'):
    """Custom ljust implementation for bytes"""
    if len(data) >= width:
        return data
    else:
        if isinstance(fillchar, int):
            fillchar = bytes([fillchar])
        elif isinstance(fillchar, str):
            fillchar = fillchar.encode('utf-8')
        
        padding_needed = width - len(data)
        padding = fillchar * padding_needed
        return data + padding

def custom_rjust(data, width, fillchar=b'\x00'):
    """Custom rjust implementation for bytes"""
    if len(data) >= width:
        return data
    else:
        if isinstance(fillchar, int):
            fillchar = bytes([fillchar])
        elif isinstance(fillchar, str):
            fillchar = fillchar.encode('utf-8')
        
        padding_needed = width - len(data)
        padding = fillchar * padding_needed
        return padding + data

def encode_value(type_name, value, types):
    """Encode a value according to its type"""
    if type_name == 'string':
        if isinstance(value, str):
            return hash_message(value.encode('utf-8')).to_bytes(32, 'big')
        else:
            return hash_message(str(value).encode('utf-8')).to_bytes(32, 'big')
    
    elif type_name == 'bytes':
        if isinstance(value, str):
            if value.startswith('0x'):
                return hash_message(bytes.fromhex(value[2:])).to_bytes(32, 'big')
            else:
                return hash_message(value.encode('utf-8')).to_bytes(32, 'big')
        else:
            return hash_message(value).to_bytes(32, 'big')
    
    elif type_name.startswith('bytes'):
        # Fixed-size bytes
        if isinstance(value, str) and value.startswith('0x'):
            hex_value = value[2:]
            # Pad or truncate to correct size
            size = int(type_name[5:]) if len(type_name) > 5 else 32
            hex_value = custom_zfill(hex_value, size * 2)[:size * 2]
            return custom_ljust(bytes.fromhex(hex_value), 32, b'\x00')
        else:
            return custom_ljust(str(value).encode('utf-8'), 32, b'\x00')[:32]
    
    elif type_name == 'address':
        if isinstance(value, str):
            if value.startswith('0x'):
                addr_hex = value[2:]
            else:
                addr_hex = value
            # Ensure it's 40 chars (20 bytes)
            addr_hex = custom_zfill(addr_hex.lower(), 40)
            return custom_rjust(bytes.fromhex(addr_hex), 32, b'\x00')
        else:
            return bytes(32)  # Zero address
    
    elif type_name.startswith('uint'):
        # Handle uint types
        if isinstance(value, str):
            if value.startswith('0x'):
                num_value = int(value, 16)
            else:
                num_value = int(value)
        else:
            num_value = int(value)
        return num_value.to_bytes(32, 'big')
    
    elif type_name.startswith('int'):
        # Handle int types
        if isinstance(value, str):
            if value.startswith('0x'):
                num_value = int(value, 16)
            else:
                num_value = int(value)
        else:
            num_value = int(value)
        
        # Handle negative numbers (two's complement)
        if num_value < 0:
            # Convert to unsigned representation
            num_value = (1 << 256) + num_value
        
        return num_value.to_bytes(32, 'big')
    
    elif type_name == 'bool':
        bool_value = bool(value)
        return (1 if bool_value else 0).to_bytes(32, 'big')
    
    elif type_name.endswith('[]'):
        # Dynamic array
        element_type = type_name[:-2]
        if not isinstance(value, (list, tuple)):
            value = [value]
        
        # Encode each element
        encoded_elements = []
        for item in value:
            if element_type in types:
                # Custom struct type
                encoded_elements.append(hash_struct(element_type, item, types).to_bytes(32, 'big'))
            else:
                # Primitive type
                encoded_elements.append(encode_value(element_type, item, types))
        
        # Hash the concatenated encoded elements
        array_data = b''.join(encoded_elements)
        return hash_message(array_data).to_bytes(32, 'big')
    
    elif type_name in types:
        # Custom struct type
        return hash_struct(type_name, value, types).to_bytes(32, 'big')
    
    else:
        # Unknown type, treat as string
        return hash_message(str(value).encode('utf-8')).to_bytes(32, 'big')

def hash_struct(primary_type, data, types):
    """Hash a struct according to EIP-712"""
    type_hash = hash_type(primary_type, types)
    encoded_data = [type_hash.to_bytes(32, 'big')]
    
    # Get the type definition
    type_def = types.get(primary_type, [])
    
    # Encode each field in the order defined in the type
    for field in type_def:
        field_name = field['name']
        field_type = field['type']
        
        if field_name in data:
            field_value = data[field_name]
            encoded_field = encode_value(field_type, field_value, types)
            encoded_data.append(encoded_field)
        else:
            # Field not present, use zero value
            encoded_data.append(bytes(32))
    
    # Concatenate all encoded data
    full_data = b''.join(encoded_data)
    
    # Return hash as integer
    return hash_message(full_data)

def encode_typed_data_v2(domain, types, primary_type, message):
    """Enhanced EIP-712 typed data encoding"""
    # Domain separator
    domain_type = {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
            {'name': 'version', 'type': 'string'},
            {'name': 'chainId', 'type': 'uint256'},
            {'name': 'verifyingContract', 'type': 'address'}
        ]
    }
    
    # Create domain hash
    domain_hash = hash_struct('EIP712Domain', domain, domain_type)
    
    # Create message hash
    message_hash = hash_struct(primary_type, message, types)
    
    # Final EIP-712 hash: \x19\x01 + domain_hash + message_hash
    final_data = (
        b"\x19\x01" + 
        domain_hash.to_bytes(32, 'big') + 
        message_hash.to_bytes(32, 'big')
    )
    
    return hash_message(final_data)

def signTypedData(private_key, domain, types, primary_type, message):
    """Sign typed data using EIP-712 standard with proper type handling"""
    # Create typed data hash
    typed_hash = encode_typed_data_v2(domain, types, primary_type, message)
    
    # Sign the hash
    r, s = sign_message(private_key, typed_hash)
    
    # Calculate recovery ID (v)
    recovery_id = calculate_recovery_id(private_key, typed_hash, r, s)
    v = 27 + recovery_id
    
    return r, s, v

def verify_signature(public_x, public_y, message_hash, r, s):
    """Verify ECDSA signature with safe arithmetic"""
    try:
        # Check signature values are in valid range
        if r < 1 or r >= N or s < 1 or s >= N:
            return False
        
        # Calculate z
        z = safe_mod(message_hash, N)
        
        # Calculate u1 = z * s^-1 mod n and u2 = r * s^-1 mod n
        s_inv = mod_inverse(s, N)
        u1 = safe_mod(z * s_inv, N)
        u2 = safe_mod(r * s_inv, N)
        
        # Calculate point (x, y) = u1*G + u2*public_key
        x1, y1 = scalar_mult(u1, GX, GY)
        x2, y2 = scalar_mult(u2, public_x, public_y)
        x, y = point_add(x1, y1, x2, y2)
        
        if x is None:
            return False
        
        # Verify r == x mod n
        return r == safe_mod(x, N)
        
    except Exception as e:
        Logger.log(f"Verification error: {e}")
        return False

def custom_zfill(s, width):
    """Custom zfill implementation"""
    if len(s) >= width:
        return s
    else:
        return '0' * (width - len(s)) + s

def int_to_hex(num, length=64):
    """Convert integer to hex string with padding - safe version"""
    try:
        hex_str = hex(num)[2:]
        return custom_zfill(hex_str, length)
    except Exception:
        return "0" * length

def format_ethereum_signature(r, s, v=27):
    """Format signature in Ethereum format (r, s, v)"""
    return {
        'r': '0x' + int_to_hex(r),
        's': '0x' + int_to_hex(s),
        'v': v
    }

# Memory management helper
def cleanup_vars():
    """Helper to cleanup large variables if needed"""
    import gc
    gc.collect()

def test_signing():
    """Test the signing functionality with error handling"""

    Logger.log("Generating random private key...")
    private_key = generate_private_key()
    
    Logger.log(f"Private key: 0x{int_to_hex(private_key)}")
    
    Logger.log("Deriving public key...")
    public_x, public_y = private_to_public(private_key)
    if public_x is None:
        raise Exception("Failed to generate public key")
    Logger.log(f"Public key X: 0x{int_to_hex(public_x)}")
    Logger.log(f"Public key Y: 0x{int_to_hex(public_y)}")

    concat_x_y = public_x.to_bytes(32, 'big') + public_y.to_bytes(32, 'big')
    eth_address = keccak.Keccak256(concat_x_y).digest()[-20:]
    Logger.log(f"Ethereum Address: 0x{binascii.hexlify(eth_address).decode()}")
    
    # Test personal message signing (ERC-191)
    message = "hello"
    Logger.log(f"=== Personal Message Signing ===")
    Logger.log(f"Message: {message}")
    
    r, s, v = signMessage(private_key, message)

    Logger.log(f"Personal Signature R: 0x{int_to_hex(r)}")
    Logger.log(f"Personal Signature S: 0x{int_to_hex(s)}")
    Logger.log(f"Personal Signature V: {v}")
    
    # Verify personal message signature
    message_hash = create_ethereum_message_hash(message)
    is_valid = verify_signature(public_x, public_y, message_hash, r, s)
    Logger.log(f"Personal message signature valid: {is_valid}")
    
    return private_key, public_x, public_y, r, s, v

def test_enhanced_signing():
    """Test the enhanced EIP-712 signing functionality"""
    Logger.log("=== Enhanced EIP-712 Typed Data Test ===")
    
    private_key = generate_private_key()
    
    Logger.log(f"Private key: 0x{int_to_hex(private_key)}")
    
    # Example domain
    domain = {
        'name': 'Ether Mail',
        'version': '1',
        'chainId': 1,
        'verifyingContract': '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    }
    
    # Example types
    types = {
        'Person': [
            {'name': 'name', 'type': 'string'},
            {'name': 'wallet', 'type': 'address'}
        ],
        'Mail': [
            {'name': 'from', 'type': 'Person'},
            {'name': 'to', 'type': 'Person'},
            {'name': 'contents', 'type': 'string'}
        ]
    }
    
    # Example message
    message = {
        'from': {
            'name': 'Cow',
            'wallet': '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
        },
        'to': {
            'name': 'Bob',
            'wallet': '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
        },
        'contents': 'Hello, Bob!'
    }
    
    primary_type = 'Mail'
    
    Logger.log(f"Domain: {domain}")
    Logger.log(f"Primary Type: {primary_type}")
    Logger.log(f"Message: {message}")
    
    # Sign the typed data
    r, s, v = signTypedData(private_key, domain, types, primary_type, message)
    
    Logger.log(f"Enhanced Typed Data Signature:")
    Logger.log(f"  R: 0x{int_to_hex(r)}")
    Logger.log(f"  S: 0x{int_to_hex(s)}")
    Logger.log(f"  V: {v}")
    
    # Test type encoding
    Logger.log(f"Type encoding test:")
    encoded_type = encode_type('Mail', types)
    Logger.log(f"Encoded Mail type: {encoded_type}")
    
    # Verify signature
    public_x, public_y = private_to_public(private_key)
    typed_hash = encode_typed_data_v2(domain, types, primary_type, message)
    is_valid = verify_signature(public_x, public_y, typed_hash, r, s)
    Logger.log(f"Signature valid: {is_valid}")
    
    return r, s, v

def test_keccak256():
    """Test Keccak256 implementation with known test vectors using the keccak module."""
    # Empty string
    h_empty = keccak.Keccak256(b"")
    digest_empty = h_empty.digest()
    hex_empty = binascii.hexlify(digest_empty).decode()
    expected_empty = "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    Logger.log(f"Empty string test - Expected: {expected_empty}")
    Logger.log(f"Empty string test - Actual:   {hex_empty}")
    Logger.log(f"Empty string test - Match: {hex_empty == expected_empty}\n")

    # 'abc'
    h_abc = keccak.Keccak256(b"abc")
    digest_abc = h_abc.digest()
    hex_abc = binascii.hexlify(digest_abc).decode()
    expected_abc = "4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45"
    Logger.log(f"'abc' test - Expected: {expected_abc}")
    Logger.log(f"'abc' test - Actual:   {hex_abc}")
    Logger.log(f"'abc' test - Match: {hex_abc == expected_abc}\n")

# Main execution
def test_all():
    Logger.log("=== Complete Ethereum Key Signing on Raspberry Pi Pico (CircuitPython) ===\n")
    
    try:
        # Test Keccak256 implementation first
        # Logger.log("Testing Keccak256 implementation...")
        # test_keccak256()

        # Run basic signing test
        Logger.log("Running basic signing test...")
        private_key, pub_x, pub_y, r, s, v = test_signing()
        
        # Format as Ethereum signature
        eth_sig = format_ethereum_signature(r, s, v)
        Logger.log(f"Ethereum formatted signature:")
        Logger.log(f"  r: {eth_sig['r']}")
        Logger.log(f"  s: {eth_sig['s']}")
        Logger.log(f"  v: {eth_sig['v']}")
        
        # Run enhanced EIP-712 test
        Logger.log("\n" + "="*60)
        Logger.log("Running enhanced EIP-712 test...")
        r2, s2, v2 = test_enhanced_signing()
        
        # Format enhanced signature
        eth_sig2 = format_ethereum_signature(r2, s2, v2)
        Logger.log(f"EIP-712 Ethereum formatted signature:")
        Logger.log(f"  r: {eth_sig2['r']}")
        Logger.log(f"  s: {eth_sig2['s']}")
        Logger.log(f"  v: {eth_sig2['v']}")
        
        # Cleanup
        cleanup_vars()
        
    except Exception as e:
        Logger.log(f"Error: {e}")
        import sys
        Logger.log(f"Error type: {type(e)}")
    
    Logger.log("=== Complete ===")


# ======== EXPOSED METHODS ========

def set_is_pico(is_pico:bool):
    """Set whether running on Pico or not"""
    global IS_PICO
    IS_PICO = is_pico
    Logger.set_is_pico(is_pico)
    DB.set_is_pico(is_pico)

def is_wallet_exists() :
    """Check if the wallet is already initialized"""
    
    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global PRIVATE_KEY_FILE
        PRIVATE_KEY_FILE = "/sd/private_key.txt"

    try:
        with open(PRIVATE_KEY_FILE, "r") as f:
            lines = f.readlines()
            if len(lines) >= 2:
                return True
            else:
                return False
    except Exception:
        return False

def init_wallet(pin, name="MyWallet", new_wallet=False):
    """Initialize the wallet with two private keys and store them"""

    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global PRIVATE_KEY_FILE, PUBLIC_KEY_FILE, PIN_FILE, NAME_FILE
        PRIVATE_KEY_FILE = "/sd/private_key.txt"
        PUBLIC_KEY_FILE = "/sd/public_key.txt"
        PIN_FILE = "/sd/pin.txt"
        NAME_FILE = "/sd/name.txt"

    if not new_wallet:
        # Check if keys already exist
        try:                
            with open(PRIVATE_KEY_FILE, "r") as f:
                lines = f.readlines()
                if len(lines) >= 2:
                    Logger.log("Private keys already exist. Skipping generation.")
                    wallet_name = get_wallet_name()
                    user_addr = get_public_key("USER")
                    llm_addr = get_public_key("LLM")
                    return {
                        "name": wallet_name,
                        "user_address": user_addr,
                        "llm_address": llm_addr
                    }
        except Exception:
            return {
                "error": "Wallet not initialized. Please initialize the wallet."
            }

    # Delete all files
    file_list = [PRIVATE_KEY_FILE, PUBLIC_KEY_FILE, PIN_FILE, NAME_FILE, "/sd/pico_tables.json", "/sd/transactions.json"]
    for file_path in file_list:
        try:
            os.remove(file_path)
        except Exception:
            pass  # Ignore if file doesn't exist

    # Generate the private keys
    Logger.log("Generating private keys...")
    user_private_key = generate_private_key()
    llm_private_key = generate_private_key()
    
    with open(PRIVATE_KEY_FILE, "w") as f:
        f.write(f"USER:{user_private_key}\n")
        f.write(f"LLM:{llm_private_key}\n")

    # Derive and store the public keys
    Logger.log("Deriving public keys...")
    user_pub_x, user_pub_y = private_to_public(user_private_key)
    llm_pub_x, llm_pub_y = private_to_public(llm_private_key)

    with open(PUBLIC_KEY_FILE, "w") as f:
        f.write(f"USER:{user_pub_x},{user_pub_y}\n")
        f.write(f"LLM:{llm_pub_x},{llm_pub_y}\n")

    with open(PIN_FILE, "w") as f:
        f.write(pin)

    with open(NAME_FILE, "w") as f:
        f.write(name)

    # Initialize the transaction table
    DB.create_table("transactions")

    user_addr = get_public_key("USER")
    llm_addr = get_public_key("LLM")

    return {
        "name": name,
        "user_address": user_addr,
        "llm_address": llm_addr
    }

def get_wallet_name():
    """Retrieve the wallet name"""
    
    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global NAME_FILE
        NAME_FILE = "/sd/name.txt"

    try:
        with open(NAME_FILE, "r") as f:
            name = f.read().strip()
            return {
                "name": name
            }
    except Exception:
        return {
            "error": "Wallet not initialized. Please initialize the wallet."
        }

def get_public_key(role="USER") :
    """Retrieve the public key for the given role (USER or LLM)"""

    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global PRIVATE_KEY_FILE, PUBLIC_KEY_FILE
        PRIVATE_KEY_FILE = "/sd/private_key.txt"
        PUBLIC_KEY_FILE = "/sd/public_key.txt"

    try:
        with open(PUBLIC_KEY_FILE, "r") as f:
            lines = f.readlines()
            for line in lines:
                if line.startswith(role + ":"):
                    parts = line.strip().split(":")[1].split(",")
                    pub_x = f"0x{int_to_hex(int(parts[0]))}"
                    pub_y = f"0x{int_to_hex(int(parts[1]))}"
                    
                    concat_x_y = int(parts[0]).to_bytes(32, 'big') + int(parts[1]).to_bytes(32, 'big')
                    eth_address = keccak.Keccak256(concat_x_y).digest()[-20:]

                    return {
                        "address": f"0x{binascii.hexlify(eth_address).decode()}"
                    }
                
            return {
                "error": f"Role {role} not found in public key file."
            }
    except Exception as e:
        Logger.log(f"Error reading public key: {e}")
        return {
            "error": f"Error occured getting public key: {e}"
        }
    
def sign_personal_message(pin, message, role="USER", transaction_id=None):
    """Sign a personal message with the specified role's private key"""

    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global PRIVATE_KEY_FILE, PUBLIC_KEY_FILE, PIN_FILE
        PRIVATE_KEY_FILE = "/sd/private_key.txt"
        PUBLIC_KEY_FILE = "/sd/public_key.txt"
        PIN_FILE = "/sd/pin.txt"

    try:
        with open(PIN_FILE, "r") as f:
            stored_pin = f.read().strip()
            if pin != stored_pin:
                Logger.log("Invalid PIN provided for signing.")
                return {
                    "error": "Invalid PIN"
                }

        with open(PRIVATE_KEY_FILE, "r") as f:
            lines = f.readlines()
            for line in lines:
                if line.startswith(role + ":"):
                    private_key = int(line.strip().split(":")[1])
                    r, s, v = signMessage(private_key, message)
                    eth_formatted_sign = format_ethereum_signature(r, s, v)

                    if role == "USER" :
                        # Add data to database
                        data_to_add = {
                            "id": str(uuid.generate_uuid_v4()),
                            "message": message,
                            "signature": [eth_formatted_sign],
                            "transaction_hash": None,
                            "transaction_status": "Queued",
                            "nonce": None
                        }
                        DB.add_entry("transactions", data_to_add, data_to_add["id"])

                        return {
                            "transaction_id": data_to_add["id"],
                            "signature": eth_formatted_sign
                        }
                    else :
                        # Update the existing transaction with LLM signature
                        if transaction_id is not None:
                            entry = DB.get_entry("transactions", transaction_id)
                            if entry is not None:
                                signatures = entry.get("signature", [])
                                signatures.append(eth_formatted_sign)
                                DB.update_entry("transactions", transaction_id, {"signature": signatures})
                                return {
                                    "transaction_id": transaction_id,
                                    "signature": eth_formatted_sign
                                }
                            else:
                                Logger.log(f"Transaction ID {transaction_id} not found for LLM signature.")
                                return {
                                    "error": "Transaction ID not found"
                                }
                        else:
                            Logger.log("No transaction ID provided for LLM signature.")
                            return {
                                "error": "No transaction ID provided for LLM signature"
                            }
                
            return {
                "error": f"Role {role} not found in private key file."
            }

    except Exception as e:
        Logger.log(f"Error signing message: {e}")
        return {
            "error": f"Error occured signing message: {e}"
        }
    
def sign_typed_data(pin, domain, types, primary_type, message, role="USER", transaction_id=None):
    """Sign typed data with the specified role's private key"""

    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global PRIVATE_KEY_FILE, PUBLIC_KEY_FILE, PIN_FILE
        PRIVATE_KEY_FILE = "/sd/private_key.txt"
        PUBLIC_KEY_FILE = "/sd/public_key.txt"
        PIN_FILE = "/sd/pin.txt"

    try:
        with open(PIN_FILE, "r") as f:
            stored_pin = f.read().strip()
            if pin != stored_pin:
                Logger.log("Invalid PIN provided for signing.")
                return {
                    "error": "Invalid PIN"
                }

        with open(PRIVATE_KEY_FILE, "r") as f:
            lines = f.readlines()
            for line in lines:
                if line.startswith(role + ":"):
                    private_key = int(line.strip().split(":")[1])
                    r, s, v = signTypedData(private_key, domain, types, primary_type, message)
                    eth_formatted_sign = format_ethereum_signature(r, s, v)

                    if role == "USER" :
                        # Add data to database
                        data_to_add = {
                            "id": str(uuid.generate_uuid_v4()),
                            "typed_data": {
                                "domain": domain,
                                "types": types,
                                "primary_type": primary_type,
                                "message": message
                            },
                            "signature": [eth_formatted_sign],
                            "transaction_hash": None,
                            "transaction_status": "Queued",
                            "nonce": None
                        }
                        DB.add_entry("transactions", data_to_add, data_to_add["id"])

                        return {
                            "transaction_id": data_to_add["id"],
                            "signature": eth_formatted_sign
                        }
                    else :
                        # Update the existing transaction with LLM signature
                        if transaction_id is not None:
                            entry = DB.get_entry("transactions", transaction_id)
                            if entry is not None:
                                signatures = entry.get("signature", [])
                                signatures.append(eth_formatted_sign)
                                DB.update_entry("transactions", transaction_id, {"signature": signatures})
                                return {
                                    "transaction_id": transaction_id,
                                    "signature": eth_formatted_sign
                                }
                            else:
                                Logger.log(f"Transaction ID {transaction_id} not found for LLM signature.")
                                return {
                                    "error": "Transaction ID not found"
                                }
                        else:
                            Logger.log("No transaction ID provided for LLM signature.")
                            return {
                                "error": "No transaction ID provided for LLM signature"
                            }
                            
            return {
                "error": f"Role {role} not found in private key file."
            }
    except Exception as e:
        Logger.log(f"Error signing typed data: {e}")
        return {
            "error": f"Error occured signing typed data: {e}"
        }
    
def confirm_transaction(pin, transaction_id, transaction_hash, nonce):
    """Confirm a transaction by updating its hash and status"""

    # If in pico, modify file paths to store in /sd
    if IS_PICO:
        global PIN_FILE
        PIN_FILE = "/sd/pin.txt"

    try:
        with open(PIN_FILE, "r") as f:
            stored_pin = f.read().strip()
            if pin != stored_pin:
                Logger.log("Invalid PIN provided for confirming transaction.")
                return False

        entry = DB.get_entry("transactions", transaction_id)
        if entry is not None:
            DB.update_entry("transactions", transaction_id, {
                "transaction_hash": transaction_hash,
                "transaction_status": "Success",
                "nonce": nonce
            })
            return True
        else:
            Logger.log(f"Transaction ID {transaction_id} not found for confirmation.")
            return False
    except Exception as e:
        Logger.log(f"Error confirming transaction: {e}")
        return False
    
def fail_transaction(transaction_id):
    """Mark a transaction as failed"""
    try:
        entry = DB.get_entry("transactions", transaction_id)
        if entry is not None:
            DB.update_entry("transactions", transaction_id, {
                "transaction_status": "Failed"
            })
            return True
        else:
            Logger.log(f"Transaction ID {transaction_id} not found for failure update.")
            return False
    except Exception as e:
        Logger.log(f"Error failing transaction: {e}")
        return False
    
def get_transaction(transaction_id):
    """Retrieve a transaction by its ID"""
    try:
        entry = DB.get_entry("transactions", transaction_id)
        if entry :
            return entry
        else :
            return {}
    except Exception as e:
        Logger.log(f"Error retrieving transaction: {e}")
        return {
            "error": f"Error retrieving transaction: {e}"
        }
    
def get_all_transactions():
    """Retrieve all transactions"""
    try:
        entries = DB.get_all_entries("transactions")
        return entries
    except Exception as e:
        Logger.log(f"Error retrieving all transactions: {e}")
        return {}