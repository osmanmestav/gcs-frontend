import random
import string
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes

def generate_private_key(key_size=2048):
    print("Generating private key")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend()
    )
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    return private_key, pem	

def gen_csr(private_key,thingName):
    print("Generating CSR")
    csr = x509.CertificateSigningRequestBuilder().subject_name(x509.Name([
          x509.NameAttribute(NameOID.COUNTRY_NAME, u"IE"),
          x509.NameAttribute(NameOID.ORGANIZATION_NAME, u"UL"),
          x509.NameAttribute(NameOID.COMMON_NAME, u"{0}".format(thingName)),

        ])).sign(private_key, hashes.SHA256(), default_backend())
    csr_pem = csr.public_bytes(serialization.Encoding.PEM)
    print("Generated CSR:")
    print(csr_pem)
    return csr_pem