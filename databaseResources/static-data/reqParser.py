
import re

def ParseReqs(raw, name):

    # clean the raw text for easier parsing
    cleaned = re.sub(r'\n', ' ', raw)                           #collapse into one line
    cleaned = re.sub(r'—', ' — ', cleaned)                      #fix formatting issue around em dashes
    cleaned = re.sub(r'  +', ' ', cleaned)                      #remove excess spaces
    cleaned = re.sub(r'(?= \(\d+\))', '\n', cleaned)             #insert new line on each subreq
    cleaned = re.sub(r'(?= \([a-z]\))', '\n', cleaned)
    cleaned = re.sub(r'(?= Option [A-Z] —)', '\n', cleaned)
    cleaned = re.sub(r'(?= \b\d+\.)', '\n', cleaned)
    split = re.split(r'\n', cleaned)

    # with open("./temp/"+name+"Cleaned.txt", "w", encoding="utf-8") as outputFile:
    #     outputFile.write(cleaned)

    newParsed = []
    newParsed = newParse(split)

    rePacked = packChildren(newParsed)

    # with open("./temp/"+name+"Parsed.txt", "w", encoding="utf-8") as outputFile:
    #     printTree(rePacked, outputFile)   
        
    return rePacked

def newParse(list):

    requirements = []
    parentStack = []

    prevNode = None
    prevReq = None
    for curr in list:

        req = {}

        curr = curr.split("Resource: ")[0]      #trim excess info
        curr = curr.split("Resources: ")[0]     #      |
        curr = curr.split("Safety Note: ")[0]   #      V

        # split the identifier and get it's type
        idnfType = getIdnfType(curr)
        # if no identifier, not a requirement, skip the line
        if not idnfType: continue

        # find the relationship between the current requirement and thr previous one and act accordingly
        relation = FindRelation(prevReq, curr)

        if not relation: 
            print("error in relation determination: "+curr)
            # print(prevReq)

        if getIdnfType(curr) == "NumDec":
            req["Parent"] = None
            parentStack = []

        elif relation == "header lines" or relation == "Sibling":
            if parentStack: req["Parent"] = parentStack[-1]
            else: req["Parent"] = None

        elif relation == "Parent":
            req["Parent"] = prevNode
            parentStack.append(prevNode)
        
        elif relation == "Uncle":
            if parentStack:
                parentStack.pop()
                if not parentStack: 
                    req["Parent"] = None
                else: 
                    req["Parent"] = parentStack[-1]
                
            else:
                req["Parent"] = None


        idnf, text = SplitIdnf(curr)
        req["rqmt_idnf"] = idnf
        req["rqmt_desc"] = text
        req["Combined"] = curr

        requirements.append(req)
        prevNode = req
        prevReq = curr

    return requirements

def SplitIdnf(line):
    if re.findall(r'\(\d+\)', line):
        split = re.split(r'(\(\d+\))',line)

    elif re.findall(r'\([a-z]\)', line):
        split = re.split(r'(\([a-z]\))', line)

    elif re.findall(r'Option [A-Z] —', line):
        split = re.split(r'(Option [A-Z] —)', line)

    elif re.findall(r'\d+\.',line):
        split = re.split(r'(\d+\.)',line)
    else:
        return None, line, None
    
    return split[1], split[2]

def getIdnfType(line):

    if re.findall(r'(?=^\(\d+\))', line):
        type = "NumParen"

    elif re.findall(r'(?=^\([a-z]\))', line):
        type = "AlphaParen"

    elif re.findall(r'(?=^Option [A-Z] —)', line):
        type = "Option"

    elif re.findall(r'(?=^\d+\. )',line):
        type = "NumDec"

    else:
        return None
    
    return type

# There is certainly a more elegant solution, but I am so far past the point of caring for this problem anymore
def FindRelation(prevLine, curLine):

    if not prevLine or getIdnfType(prevLine)== None:
        return "header lines"

    # From NumDec types
    if (getIdnfType(prevLine) == "NumDec") and (getIdnfType(curLine) == "NumDec"):
        return "Sibling"
    if (getIdnfType(prevLine) == "NumDec") and (getIdnfType(curLine) == "Option"):
        return "Parent"
    if (getIdnfType(prevLine) == "NumDec") and (getIdnfType(curLine) == "NumParen"):
        return None
    if (getIdnfType(prevLine) == "NumDec") and (getIdnfType(curLine) == "AlphaParen"):
        return "Parent"
    
    # From Option types
    if (getIdnfType(prevLine) == "Option") and (getIdnfType(curLine) == "NumDec"):
        return None
    if (getIdnfType(prevLine) == "Option") and (getIdnfType(curLine) == "Option"):
        return None
    if (getIdnfType(prevLine) == "Option") and (getIdnfType(curLine) == "NumParen"):
        return "Parent"
    if (getIdnfType(prevLine) == "Option") and (getIdnfType(curLine) == "AlphaParen"):
        return None
    
    # From NumParen Types
    if (getIdnfType(prevLine) == "NumParen") and (getIdnfType(curLine) == "NumDec"):
        return "Uncle"
    if (getIdnfType(prevLine) == "NumParen") and (getIdnfType(curLine) == "Option"):
        return "Uncle"
    if (getIdnfType(prevLine) == "NumParen") and (getIdnfType(curLine) == "NumParen"):
        return "Sibling"
    if (getIdnfType(prevLine) == "NumParen") and (getIdnfType(curLine) == "AlphaParen"):
        return DisambiguateRelation(prevLine)
    
    # From AlphaParen Types
    if (getIdnfType(prevLine) == "AlphaParen") and (getIdnfType(curLine) == "NumDec"):
        return "Uncle"
    if (getIdnfType(prevLine) == "AlphaParen") and (getIdnfType(curLine) == "Option"):
        return "Uncle"
    if (getIdnfType(prevLine) == "AlphaParen") and (getIdnfType(curLine) == "NumParen"):
        return DisambiguateRelation(prevLine)
    if (getIdnfType(prevLine) == "AlphaParen") and (getIdnfType(curLine) == "AlphaParen"):
        return "Sibling"
    

def DisambiguateRelation(prevLine):

    if re.findall(r'do \w+ of the following:', prevLine, flags=re.IGNORECASE):
        return "Parent"
    
    elif re.findall(r'do the following:', prevLine, flags=re.IGNORECASE):
        return "Parent"
    
    elif re.findall(r'\w+ of the following', prevLine, flags=re.IGNORECASE):
        return "Parent"
    
    else: 
        # print("disambiguate: NEPHEW relation found - "+prevLine)
        return "Uncle"


def packChildren(list):

    rootReqs = []

    for req in list:
        req["Children"] = []

    for req in list:
        parent = req.get("Parent")

        if parent:
            parent["Children"].append(req)
        else:
            rootReqs.append(req)
    
    return rootReqs

def printTree(tree, file, level= 0):
    for node in tree:
        file.write("\t" * level+ node["rqmt_idnf"])
        file.write(node["rqmt_desc"]+"\n")
        printTree(node["Children"], file, level+1)
        file.write("\n")


# debug utility
# name = "Soil and Water Conservation"
# with open("./scraperOutputDebug/"+name+".txt", "r", encoding="utf-8") as inputFile:
#     rawReqs = inputFile.read()

# reqs = ParseReqs(rawReqs, name)

