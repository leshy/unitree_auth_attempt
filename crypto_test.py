#!/usr/bin/env python3
import json
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import AES
from Crypto.Cipher import PKCS1_v1_5
import hashlib
import uuid
import binascii

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
    # Maximum chunk size for encryption with RSA/ECB/PKCS1Padding is key size , key- 11 bytes
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
    chunked = [last_10_chars[i : i + 2] for i in range(0, len(last_10_chars), 2)]

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



def prepareEncryptedRequest(response, sdp, aes_key):
    decoded_response = base64.b64decode(response).decode("utf-8")

    # Parse the decoded response as JSON
    decoded_json = json.loads(decoded_response)

    # Extract the 'data1' field from the JSON
    data1 = decoded_json.get("data1")

    # Generate AES key
    path_ending = calc_local_path_ending(data1)
    public_key_pem = data1[10 : len(data1) - 10]
    
    aes_key = client_data["aes_key"]
    print(f"PATH: {path_ending}")
    print(f"AES key: {aes_key}")
    print(f"RSA PEM: {public_key_pem}")
    public_key = rsa_load_public_key(public_key_pem)
    
    print("\n", public_key.export_key().decode('utf-8'), "\n")

    print("Test", aes_encrypt("test", aes_key))

    
    # Encrypt the SDP data
    encoded_sdp = json.dumps(sdp)
    print("SDP", encoded_sdp)
    encrypted_sdp = aes_encrypt(encoded_sdp, aes_key)
    print("Encrypted SDP", encrypted_sdp)
    
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

    print(f"http://<robot-ip>:9991/con_ing_{path_ending}")
    
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
        "path_ending": path_ending,
        "url": f"http://<robot-ip>:9991/con_ing_{path_ending}"
    }
    
    with open('python_crypto_output.json', 'w') as f:
        json.dump(output_data, f, indent=2)
    
    print("\nOutput saved to python_crypto_output.json")


try:

    # Load the robot data we collected
    with open('mock/robot_data.raw', 'r') as f:
        robot_response = f.read()

    with open('mock/aes.json', 'r') as f:
        client_data = json.load(f)
        
    print(prepareEncryptedRequest(robot_response, client_data["sdp"], client_data["aes_key"]))
    
except Exception as e:
    print(f"Error during encryption: {e}")

    
