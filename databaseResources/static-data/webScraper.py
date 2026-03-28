
from bs4 import BeautifulSoup
import time, random


# sereis of pages to simulate human site traffic
landingSequence = [
    "https://www.scouting.org/",
    "https://www.scouting.org/programs/scouts-bsa/",
    "https://www.scouting.org/skills/merit-badges/",
    "https://www.scouting.org/skills/merit-badges/all/",
]


# scrapes the scouting website for merit badge description, eagle status, and requirements
def Scrape(name, ctx):

        # set the context and open a new page
        context = ctx
        page = context.new_page()

        # simulate human pathing to the badge page
        for p in landingSequence:
            time.sleep(random.uniform(2,5))
            page.goto(p)
            page.mouse.wheel(0, random.randint(300,800))


        # wait a random interval before accessing the destination page
        time.sleep(random.uniform(2, 5))
        page.goto(GetAddress(name))

        # grab the raw html and check if we hit cloudfare instead
        htmlRaw = page.content()
        if "access denied" in htmlRaw:
            # if a hard block throw error
             print("Error fetching merit badge reqs: access denied")
             return("Error fetching desc", True, "Error fetching requirements")
        elif "Just a moment..." in htmlRaw:
            #if it's just a challenge, wait and continue
            print("cloudfare challenge")
            time.sleep(10)

        # grab the page content again now that we're past cloudfare and use beutiful soup to help parse
        htmlRaw = page.content()
        soup = BeautifulSoup(htmlRaw, "lxml")

        with open("./scraperOutputDebug/htmls/"+name+".txt", "w", encoding="utf-8") as f: 
            # write whole page into file 
            f.write(soup.prettify())

        # find the description
        header = soup.find(lambda tag: tag.name=="h3" and "Merit Badge Overview" in tag.get_text()) # Locate the badge overview section
        if not header:
             print("error on the header for basge: "+name)
        container = header.find_parent("div").find_parent("div").find_next_sibling("div") #from the overview title grab the next container which will hold the desc
        if not container:
             print("error on the container for badge: "+name)
        desc = container.get_text(" ", strip=True) # grab the desc


        # check if eagle required
        isEagleRequired = False # assume false
        for element in soup.find_all(True):
            if element == header:
                break                     # if we hit badge overview stop

            if element.string and "Eagle Required" in element.string:
                isEagleRequired = True    # if we see the marker it's eagle required

        # grab the entire requirements container for later
        rawReqs = soup.select_one(".mb-requirement-container").get_text()

        # write the retreived info useful for debug, leave commented otherwise
        # with open("./scraperOutputDebug/"+name+".txt", "w", encoding="utf-8") as f: 
        #     # write whole page into file 
        #     # f.write(soup.prettify())
        #     f.write(desc+"\n")
        #     f.write(str(isEagleRequired)+"\n")
        #     f.write(rawReqs)
        


        
        return(desc, isEagleRequired, rawReqs)


# makes the name of the badge into the address of the related webpage
def GetAddress(name):
    prefix = "https://www.scouting.org/merit-badges/"
    name = name.replace(" ", "-")
    name = name.replace(",", "")
    name = name.lower()
    return prefix + name + '/'