################################################### Connecting to AWS
import boto3
from botocore.config import Config
import json
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from helpers.cert_helper import generate_private_key
from helpers.cert_helper import gen_csr
from helpers.file_helper import saveCertificate
################################################### Parameters for Thing
thingArn = ''
thingId = ''
thingName = 'erkan'
defaultPolicyName = 'C569B29A9ECF843F0AF9E4B46CA84DC8B52F86C7C9B5D6B2CDC13B7E72479891'
###################################################

###################################################Config
my_config = Config(
    region_name = 'eu-west-1',
    signature_version = 'v4',
    retries = {
        'max_attempts': 10,
        'mode': 'standard'
    }
)



thingClient = boto3.client('iot',config=my_config)
private_key=generate_private_key()
csr=gen_csr(private_key[0],thingName)
certResponse=thingClient.create_certificate_from_csr(
    certificateSigningRequest=csr.decode('utf-8'),
    setAsActive=True
)
data = json.loads(json.dumps(certResponse, sort_keys=False, indent=4))
for element in data: 
	if element == 'certificateArn':
		certificateArn = data['certificateArn']
	elif element == 'keyPair':
		PublicKey = data['keyPair']['PublicKey']
		PrivateKey = data['keyPair']['PrivateKey']
	elif element == 'certificatePem':
		certificatePem = data['certificatePem']
	elif element == 'certificateId':
		certificateId = data['certificateId']
saveCertificate("deviceCert.key",private_key[1].decode('utf-8'))						
saveCertificate("deviceCert.csr",csr.decode('utf-8'))	
saveCertificate("deviceCert.crt",data['certificatePem'])	

thingResponse = thingClient.create_thing(
    thingName = thingName
  )
response = thingClient.attach_policy(
		policyName = defaultPolicyName,
		target = certificateArn
)
response = thingClient.attach_thing_principal(
		thingName = thingName,
		principal = certificateArn
)