#!/usr/bin/env python3
import json
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import AES
from Crypto.Cipher import PKCS1_v1_5
import hashlib
import uuid
import binascii

# Load the robot data we collected
with open('robot_data.json', 'r') as f:
    robot_data = json.load(f)

print("Loaded robot data:")
print(f"Path ending: {robot_data['pathEnding']}")
print(f"Public key length: {len(robot_data['publicKeyPem'])}")

# Functions from decrypt.py
def pad(data: str) -> bytes:
    """Pad data to be a multiple of 16 bytes (AES block size)."""
    block_size = AES.block_size
    padding = block_size - len(data) % block_size
    padded_data = data + chr(padding) * padding
    return padded_data.encode("utf-8")

def aes_encrypt(data: str, key: str) -> str:
    """Encrypt the given data using AES (ECB mode with PKCS5 padding)."""
    # Ensure key is 32 bytes for AES-256
    key_bytes = key.encode("utf-8")
    # Pad the data to ensure it is a multiple of block size
    padded_data = pad(data)
    # Create AES cipher in ECB mode
    cipher = AES.new(key_bytes, AES.MODE_ECB)
    encrypted_data = cipher.encrypt(padded_data)
    encoded_encrypted_data = base64.b64encode(encrypted_data).decode("utf-8")
    return encoded_encrypted_data

def rsa_encrypt(data: str, public_key: RSA.RsaKey) -> str:
    """Encrypt data using RSA and a given public key."""
    cipher = PKCS1_v1_5.new(public_key)
    # Maximum chunk size for encryption with RSA/ECB/PKCS1Padding is key size - 11 bytes
    max_chunk_size = public_key.size_in_bytes() - 11
    data_bytes = data.encode("utf-8")
    encrypted_bytes = bytearray()
    for i in range(0, len(data_bytes), max_chunk_size):
        chunk = data_bytes[i : i + max_chunk_size]
        encrypted_chunk = cipher.encrypt(chunk)
        encrypted_bytes.extend(encrypted_chunk)
    # Base64 encode the final encrypted data
    encoded_encrypted_data = base64.b64encode(encrypted_bytes).decode("utf-8")
    return encoded_encrypted_data

def unpad(data: bytes) -> str:
    """Remove padding from data."""
    padding = data[-1]
    return data[:-padding].decode("utf-8")

def aes_decrypt(encrypted_data: str, key: str) -> str:
    """Decrypt the given data using AES (ECB mode with PKCS5 padding)."""
    # Ensure key is 32 bytes for AES-256
    key_bytes = key.encode("utf-8")
    # Decode Base64 encrypted data
    encrypted_data_bytes = base64.b64decode(encrypted_data)
    # Create AES cipher in ECB mode
    cipher = AES.new(key_bytes, AES.MODE_ECB)
    # Decrypt data
    decrypted_padded_data = cipher.decrypt(encrypted_data_bytes)
    # Unpad the decrypted data
    decrypted_data = unpad(decrypted_padded_data)
    return decrypted_data

def generate_aes_key() -> str:
    uuid_32 = uuid.uuid4().bytes
    uuid_32_hex_string = binascii.hexlify(uuid_32).decode("utf-8")
    return uuid_32_hex_string

def calc_local_path_ending(data1):
    # Initialize an array of strings
    strArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
    
    # Extract the last 10 characters of data1
    last_10_chars = data1[-10:]
    
    # Split the last 10 characters into chunks of size 2
    chunked = [last_10_chars[i:i+2] for i in range(0, len(last_10_chars), 2)]
    
    # Initialize an empty list to store indices
    arrayList = []
    
    # Iterate over the chunks and find the index of the second character in strArr
    for chunk in chunked:
        if len(chunk) > 1:
            second_char = chunk[1]
            try:
                index = strArr.index(second_char)
                arrayList.append(index)
            except ValueError:
                # Handle case where the character is not found in strArr
                print(f"Character {second_char} not found in strArr.")
    
    # Convert arrayList to a string without separators
    joinToString = "".join(map(str, arrayList))
    
    return joinToString

def rsa_load_public_key(pem_data: str) -> RSA.RsaKey:
    """Load an RSA public key from a PEM-formatted string."""
    key_bytes = base64.b64decode(pem_data)
    return RSA.import_key(key_bytes)

# Test path ending calculation
calculated_path_ending = calc_local_path_ending(robot_data["data1"])
print(f"Calculated path ending: {calculated_path_ending}")
print(f"Expected path ending: {robot_data['pathEnding']}")
print(f"Path ending matches: {calculated_path_ending == robot_data['pathEnding']}")

# Test with some sample SDP data
sample_sdp_data = '{"id":"STA_localNetwork","sdp":"v=0\\r\\no=- 3645197422144804388 2 IN IP4 127.0.0.1\\r\\ns=-\\r\\nt=0 0\\r\\na=group:BUNDLE 0\\r\\na=extmap-allow-mixed\\r\\na=msid-semantic: WMS\\r\\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\\r\\nc=IN IP4 0.0.0.0\\r\\na=ice-ufrag:fYVp\\r\\na=ice-pwd:pG7i0TDjCBcVPMrDVyhhlIUP\\r\\na=ice-options:trickle\\r\\na=fingerprint:sha-256 BE:32:40:7E:87:B6:E1:A1:03:73:94:95:3B:48:BC:7F:C2:A5:98:7E:B2:AF:FC:99:29:D7:E2:75:A1:96:42:B6\\r\\na=setup:actpass\\r\\na=mid:0\\r\\na=sctp-port:5000\\r\\na=max-message-size:262144\\r\\n","type":"offer"}'

# Create real key and encrypt
try:
    # Generate AES key
    aes_key = generate_aes_key()
    print(f"\nGenerated AES key: {aes_key} (length: {len(aes_key)})")
    
    # Load the public key
    public_key = rsa_load_public_key(robot_data["publicKeyPem"])
    print("Loaded public key successfully")
    
    # Encrypt the SDP data
    encrypted_sdp = aes_encrypt(sample_sdp_data, aes_key)
    print(f"Encrypted SDP (first 50 chars): {encrypted_sdp[:50]}...")
    
    # Encrypt the AES key with RSA
    encrypted_key = rsa_encrypt(aes_key, public_key)
    print(f"Encrypted key (first 50 chars): {encrypted_key[:50]}...")
    
    # Create the form data that would be sent to the robot
    form_data = {
        "data1": encrypted_sdp,
        "data2": encrypted_key
    }
    
    print("\nForm data that would be sent to the robot:")
    print(f"data1 length: {len(form_data['data1'])}")
    print(f"data2 length: {len(form_data['data2'])}")
    
    print("\nThis is the data that should be sent to:")
    print(f"http://<robot-ip>:9991/con_ing_{robot_data['pathEnding']}")
    
    # Output the URL-encoded form that would be sent (for comparison with TypeScript)
    import urllib.parse
    url_encoded = urllib.parse.urlencode(form_data)
    print(f"\nURL-encoded form (first 100 chars): {url_encoded[:100]}...")
    
    # Save the results to a file for comparison
    output_data = {
        "aes_key": aes_key,
        "encrypted_sdp": encrypted_sdp,
        "encrypted_key": encrypted_key,
        "url_encoded_form": url_encoded,
        "path_ending": robot_data['pathEnding'],
        "url": f"http://<robot-ip>:9991/con_ing_{robot_data['pathEnding']}"
    }
    
    with open('python_crypto_output.json', 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print("\nOutput saved to python_crypto_output.json")
    
except Exception as e:
    print(f"Error during encryption: {e}")