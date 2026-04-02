
import re

def ParseReqs(raw, name):

    # clean the raw text for easier parsing
    cleaned = re.sub(r'\n', ' ', raw)                           #collapse into one line
    cleaned = re.sub(r'—', ' — ', cleaned)                      #fix formatting issue around em dashes
    cleaned = re.sub(r'  +', ' ', cleaned)                      #remove excess spaces

    # with open("./temp/"+name+"Cleaned.txt", "w", encoding="utf-8") as outputFile:
    #     outputFile.write(cleaned)

    parsed = []
    parsed, _ = parseRecursive(parsed, cleaned, False)

    with open("./temp/"+name+"Parsed.txt", "w", encoding="utf-8") as outputFile:
        printRecursive(parsed, outputFile)

    return parsed



def parseRecursive(list, mixedText, isChild):

    text = "error in requirement parsing"   #default value should always get overwritten

    # case: top level
    if re.findall(r'\d+\.', mixedText):
        split = re.split(r'(\d+\.)', mixedText)


    # case: Multi option
    elif re.findall(r'Option [A-Z] —', mixedText) and isChild:
        split = re.split(r'(Option [A-Z] —)', mixedText)

    # case: normal subreqs
    elif re.findall(r'\([a-z]\)', mixedText) and isChild:
        split = re.split(r'(\([a-z]\))', mixedText)

    # case: deep sub reqs
    elif re.findall(r'\(\d+\)', mixedText) and isChild:
        split = re.split(r'(\(\d+\))', mixedText)

    # base case: no children
    else:
        children = []
        return children, mixedText
    
    text = split[0] # This should be just the text of the parent requirement (or the header on pass 1)

    # turn split requirements into lists and recursively get their sub reqs
    #loop through every other item since split is in form: [idnf, text, idnf, text,..]
    for i in range(1, len(split)-1, 2):
        req = []                                            #clear our working lists
        children = []
        req.append(split[i])                                #i will be our identifier
        children, child_text = parseRecursive([], split[i+1], True)        #recursive call to find children
        child_text = child_text.split("Resource: ")[0]    #trim excess info
        child_text = child_text.split("Resources: ")[0] #trim excess
        child_text = child_text.split("Safety Note: ")[0] #trim excess
        req.append(child_text.strip())                    #current requirement's text
        req.append(children)                                #list of all sub requirements
        list.append(req)                                    #add requirement to our output list
    return list, text


    
    
def printRecursive(list, file):
    for item in list:
        file.write(item[0])
        file.write(" "+item[1])
        file.write("\n")
        if item[2]:
            printRecursive(item[2], file)
            file.write("\n")


with open("./scraperOutputDebug/Archery.txt", "r", encoding="utf-8") as inputFile:
    rawReqs = inputFile.read()

reqs = ParseReqs(rawReqs, "Archery")

