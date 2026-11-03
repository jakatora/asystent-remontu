"""A vivid synthetic swatch for verifying decoded photos in CI screenshots."""
import struct
import zlib


def _chunk(kind, payload):
    return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload))


def write_managed_photo(path):
    raw = (b'\x00' + b'\xc9\x16\x9a' * 64) * 64
    header = struct.pack('>IIBBBBB', 64, 64, 8, 2, 0, 0, 0)
    path.write_bytes(
        b'\x89PNG\r\n\x1a\n' + _chunk(b'IHDR', header)
        + _chunk(b'IDAT', zlib.compress(raw)) + _chunk(b'IEND', b'')
    )
