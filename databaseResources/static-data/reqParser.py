
import re

def ParseReqs(raw, name):

    # clean the raw text for easier parsing
    cleaned = re.sub(r'\n', ' ', raw)                           #collapse into one line
    cleaned = re.sub(r'—', ' — ', cleaned)                      #fix formatting issue around em dashes
    cleaned = re.sub(r'  +', ' ', cleaned)                      #remove excess spaces
    # cleaned = re.sub(r'(?=\(\d+\))', '\n', cleaned)             #insert new line on each subreq
    # cleaned = re.sub(r'(?=\([a-z]\))', '\n', cleaned)
    # cleaned = re.sub(r'(?=Option [A-Z] —)', '\n', cleaned)
    # cleaned = re.sub(r'(?=\d+\.)', '\n', cleaned)

    with open("./temp/"+name+"Cleaned.txt", "w", encoding="utf-8") as outputFile:
        outputFile.write(cleaned)

    parsed = []
    parsed, _ = parseRecursive(parsed, cleaned, 1)

    with open("./temp/"+name+"Parsed.txt", "w", encoding="utf-8") as outputFile:
        printRecursive(parsed, outputFile)

    return parsed



def parseRecursive(list, mixedText, depth):

    text = "error in requirement parsing"   #default value should always get overwritten
    split = []

    nextDelimAt, nextDelimType = FindNextDelim(mixedText)

    #top level always uses "1." notation
    if depth == 1:
            split = re.split(r'(\d+\.)', mixedText)

    #check for Multi option, otherwise "(a)" notation
    elif depth == 2:
        if re.search(r'(Option [A-Z] —)', mixedText):
            split = re.split(r'(Option [A-Z] —)', mixedText)

        else:
            if re.findall(r'\([a-z]\)', mixedText): 
                split = re.split(r'(\([a-z]\))', mixedText)

    #for level 3 and lower evens are always (a) and odds are always (1)
    elif depth%2 == 0:
        if re.findall(r'\([a-z]\)', mixedText):
            split = re.split(r'(\([a-z]\))', mixedText)

    else:
        if re.findall(r'\(\d+\)', mixedText):
            split = re.split(r'(\(\d+\))', mixedText)


    # base case: no children
    if not split:
        return [], mixedText
    
    text = split[0] # This should be just the text of the parent requirement (or the header on pass 1)

    #we loop through every other item since split is in form: [idnf, text, idnf, text,..]
    # reattach grandchildren mistaken as siblings to their parents

    for i in split:
        print(i[:12])

    siblings = []
    grandchildren = []
    for i in range(1, len(split)-1, 2):
        if split[i] in siblings:
            # print("duplicate: "+split[i]+"    desc: "+split[i+1][:20]+"  "+repr(depth))
            # print("preceding desc: "+split[i-1][:20])
            split[i-1] = split[i-1]+split[i]+split[i+1]
            # print(split[i-1])

            # print(split[i+1][:50])
            grandchildren.append(split[i])
            grandchildren.append(split[i+1])
        else:
            siblings.append(split[i])
    
    for child in grandchildren:
        if child in split:
            split.pop(split.index(child))


    # print(siblings)
    # turn split requirements into lists and recursively get their sub reqs
    for i in range(1, len(split)-1, 2):
        req = []                                            #clear our working lists
        req.append(split[i])                                #i will be our identifier
        # print(split[i+1][:50])
        print("parent: "+split[i]+"  "+repr(depth))
        children, child_text = parseRecursive([], split[i+1], depth+1)        #recursive call to find children
        child_text = child_text.split("Resource: ")[0]      #trim excess info
        child_text = child_text.split("Resources: ")[0]     #      |
        child_text = child_text.split("Safety Note: ")[0]   #      V
        # print(split[i]+" "+child_text.strip()+"   "+repr(depth))
        req.append(child_text.strip())                      #child requirement's text
        req.append(children)                                #list of all sub requirements
        list.append(req)                                    #add requirement to our output list
    return list, text

def FindNextDelim(text):

    nextDelimAt = None
    nextDelimType = None

    delimTypes = [
        r'\(\d+\)',
        r'\([a-z]\)',
        r'(Option [A-Z] —)',
        r'\d+\.'
    ]

    for delim in delimTypes:

        delimLocs = list(re.finditer(delim, text))
        
        if delimLocs:
            if nextDelimAt and delimLocs[0].start() < nextDelimAt:
                nextDelimAt = delimLocs[0]
                nextDelimType = delim

    return nextDelimAt, nextDelimType

    
def printRecursive(list, file):
    for item in list:
        file.write(item[0])
        file.write(" "+item[1])
        file.write("\n")
        if item[2]:
            # file.write("begin "+item[0]+" children\n")
            printRecursive(item[2], file)
            file.write("\n")
            # file.write("end "+item[0]+" children\n\n")


with open("./scraperOutputDebug/Archery.txt", "r", encoding="utf-8") as inputFile:
    rawReqs = inputFile.read()

reqs = ParseReqs(rawReqs, "Archery")

