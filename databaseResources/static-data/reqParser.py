
import re

def ParseReqs(raw):

    # remove excessive white space
    cleaned = re.sub(r"\s+", " ", raw).strip()

    return parseRecursive(cleaned)



def parseRecursive(mixed):
    
    # case: top level
    if re.findall(r'\d+.', mixed):
        split = re.split(r'(\d+.)', mixed)
        split.pop(0) # delete and ignore header info

    # case: normal subreqs
    elif re.findall(r'\([a-z]\)', mixed):
        split = re.split(r'(\([a-z]\))', mixed)

    # case: Multi option
    elif re.findall(r'Option [a-zA-Z]', mixed):
        split = re.split(r'(Option [a-zA-Z])', mixed)

    # case: deep sub reqs
    elif re.findall(r'\(\d+\)', mixed):
        split = re.split(r'(\(\d+\))', mixed)


    # base case: no children
    else:
        return idnf, text, None

    
    



with open("./scraperOutputDebug/Space Exploration.txt", "r") as inputFile:
    rawReqs = inputFile.read()

out = ParseReqs(rawReqs)

with open("./temp/parsed.txt", "w", encoding="utf-8") as outputFile:
    for req in out:
        outputFile.write(req[0])
        outputFile.write(req[1]+"\n")
        if req[2]:
            for item in req[2]:
                outputFile.write(item+"\n")