
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import lxml
import time, random



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
        if "Just a moment..." in htmlRaw:
            print("Error fetching meritbadge page: Cloudfare block")
            print(htmlRaw[:1000])
        else:
            soup = BeautifulSoup(htmlRaw, "lxml")
            print("hecker man time")
        
        return("TODO: finish scraper", True)
        



    #     isEagle = bool(soup.find(string=lambda x: x and "&nbsp;Eagle Required" in x))
    #     print(isEagle)


# makes the name of the badge into the address of the related webpage
def GetAddress(name):
    prefix = "https://www.scouting.org/merit-badges/"
    name = name.replace(" ", "-")
    name = name.replace(",", "")
    name = name.lower()
    return prefix + name + '/'
    

# Scrape("Signs, Signals, and Codes")
# Scrape("Camping")