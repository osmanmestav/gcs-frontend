

def saveCertificate(file_name,file):
    with open('tmp/'+file_name, 'w') as outfile:
	    outfile.write(file)

