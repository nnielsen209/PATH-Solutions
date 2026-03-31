
import csv
import webScraper
from playwright.sync_api import sync_playwright
import random
import reqParser


from supabase import create_client, Client
import os
from dotenv import load_dotenv

# create a supabase client usable by python
load_dotenv()
supabase: Client = create_client(os.getenv("EXPO_PUBLIC_SUPABASE_URL"), os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY"))

if supabase:
    print("Connected to supabase! :)")
else:
    print("Error connecting to Supabase :(")

# this is here for dev and debug, input file should be controlled by app later
inputFile = "debugSchedule.csv"

# useragents to rotate for the scraper
user_agents = [
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121 Safari/537.36",
"Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/537.36 Chrome/120 Safari/537.36"
]


# main parser function will read the csv and turn it into badge and activity table entries
def InitializeBadgesAndActivities(scheduleCSV):
    # set empty lists to be filled as we parse
    badgesToInit = []
    activitiesToInit = []

    # open the schedule csv to begin parsing
    with open(scheduleCSV, newline="", encoding="utf-8") as f:
        reader = csv.reader(f, skipinitialspace=True)

        # create a playwright context to pass to the scraper
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent= random.choice(user_agents),
                viewport={"width":1280,"height":800},
                timezone_id="America/Chicago"
            )


            for row in reader:
                badge = {} # this dict will becom an insert statement for the merit_badge table
                # skip empty row
                if not any(cell.strip() for cell in row): 
                    continue

                # skip the header row
                if(row[1] == "ACTIVITY"):
                    continue
                else:
                    #parse line into relevant column values

                    # check for multiple badges, split the names if there's multiple
                    multiBadge = False
                    if ';' in row[1]:
                        multiBadge = True
                        name1, name2= [n.strip() for n in row[1].split(';')]
                    else:
                        name1 = row[1]

                    
                    activityName = row[1] #name of the activity (always takes the full name)
                    dept = row[3] # badge department


                    # parse the period columns
                    activity = {} # this dict will become an insert statement for the activity table
                    for i in range(4,10):#columns 5-10 hold the schedule info, but grab column 11 to ensure default case is hit
                        match row[i]:
                            case 'y': # y indicates the start of a new activity
                                activity["activity_name"] = activityName
                                activity["periodNumber"] = i - 3
                                activity["activity_duration"] = 1

                            case 'c': # c indicates the continuation of an activity from the previous hour
                                if row[i-1] == 'y':
                                    activity["activity_duration"] = 2
                                if row[i-1] == 'c':
                                    activity["activity_duration"] = 3
                            
                            case _: # default case, previous hour's activiy ended add working activity to list and clear for next activity
                                
                                if(activity): activitiesToInit.append(activity)
                                activity = {}

                    # skip badge assigments if non badge activity
                    if row[2] != 'x':
                        badge["badge_name"] = name1
                        badge["departmentName"] = dept
                        desc, isEagle, rawReqs = webScraper.Scrape(name1, context)
                        print(name1)
                        # print(desc)
                        # print(isEagle)
                        badge["badge_desc"] = desc
                        badge["eagle_badge"] = isEagle
                        badge["raw_reqs"] = rawReqs
                        badgesToInit.append(badge)

                        # add the secobd badge if there is one
                        if multiBadge:
                            badge = {}
                            badge["badge_name"] = name2
                            badge["departmentName"] = dept
                            desc, isEagle, rawReqs = webScraper.Scrape(name2, context)
                            print(name2)
                            badge["badge_desc"] = desc
                            badge["eagle_badge"] = isEagle
                            badge["raw_reqs"] = rawReqs
                            badgesToInit.append(badge)
                
            # close the scraper's browser
            browser.close()
        
        # both toInit lists filled but some values need to be turned into foriegn keys before they can be inserted
        # need to translate department names and period numbers into their respective IDs

        # retrieve the periods and their ids then map them
        periodResponse = supabase.table("period").select("period_id,period_nmbr").execute()
        periodMap = {p["period_nmbr"]: p["period_id"] for p in periodResponse.data}

        #likewise retrieve and map the departments
        deptResponse = supabase.table("camp_dpmt").select("dpmt_id,dpmt_name").execute()
        deptMap = {d["dpmt_name"]: d["dpmt_id"] for d in deptResponse.data}


        for badge in badgesToInit:
            # translate department names then remove the extra data
            badge["dpmt_id"] = deptMap.get(badge["departmentName"])
            badge.pop("departmentName", None)
            # send requirement text to parser and delete it
            reqParser.ParseReqs(badge["raw_reqs"])
            badge.pop("raw_reqs", None)



        for act in activitiesToInit:
            # trnslate period numbers to ids then remove the extra data
            act["period_id"] = periodMap.get(act["periodNumber"])
            act.pop("periodNumber", None)



        # insert the badges / update them if they already exist
        # resp = supabase.table("merit_badge").upsert(badgesToInit, on_conflict="badge_name").execute()
        # if resp.data is None:
        #     print("error upserting the badges: ")
        # else:
        #     print("badges upserted! :)")

        # same operation for the activities
        # resp = None #clear resp jusr in case
        # resp = supabase.table("activity").upsert(activitiesToInit, on_conflict="activity_name,period_id").execute()
        # if resp.data is None:
        #     print("Error upserting the activities: ")
        # else:
        #     print("Activities upserted! :)")     


               
            
# temp debug lines remove later
scriptDir = os.path.dirname(__file__)
filePath = os.path.join(scriptDir, inputFile)
InitializeBadgesAndActivities(filePath)
