#!/usr/bin/env python3
from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64
import uuid
import binascii

###############
### AES handling
###############

def pad(data: str) -> bytes:
    """Pad data to be a multiple of 16 bytes (AES block size)."""
    block_size = AES.block_size
    padding = block_size - len(data) % block_size
    padded_data = data + chr(padding) * padding
    return padded_data.encode('utf-8')

def unpad(data: bytes) -> str:
    """Remove padding from data."""
    padding = data[-1]
    return data[:-padding].decode('utf-8')

def aes_encrypt(data: str, key: str) -> str:
    """Encrypt the given data using AES (ECB mode with PKCS5 padding)."""
    # Ensure key is 32 bytes for AES-256
    key_bytes = key.encode('utf-8')

    # Pad the data to ensure it is a multiple of block size
    padded_data = pad(data)

    # Create AES cipher in ECB mode
    cipher = AES.new(key_bytes, AES.MODE_ECB)

    # Encrypt data
    encrypted_data = cipher.encrypt(padded_data)

    # Encode encrypted data to Base64
    encoded_encrypted_data = base64.b64encode(encrypted_data).decode('utf-8')

    return encoded_encrypted_data

def aes_decrypt(encrypted_data: str, key: str) -> str:
    """Decrypt the given data using AES (ECB mode with PKCS5 padding)."""
    # Ensure key is 32 bytes for AES-256
    key_bytes = key.encode('utf-8')

    # Decode Base64 encrypted data
    encrypted_data_bytes = base64.b64decode(encrypted_data)

    # Create AES cipher in ECB mode
    cipher = AES.new(key_bytes, AES.MODE_ECB)

    # Decrypt data
    decrypted_padded_data = cipher.decrypt(encrypted_data_bytes)

    # Unpad the decrypted data
    decrypted_data = unpad(decrypted_padded_data)

    return decrypted_data


print(aes_encrypt("test", "d0288048ddb84ab9811b1dca3fc96eb5"))
