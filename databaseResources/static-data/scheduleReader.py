
import csv

import 
from dotenv import load_dotenv
import glob
import os

# this is here for dev and debug, input file should be controlled by app later
inputFile = "./MASTER_ACTIVITY_SCHEDULE_2026.csv"

# Load environment variables from a .env file (optional, but recommended)
load_dotenv()

SUPABASE_URL = os.environ.get("EXPO_PUBLIC_SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "YOUR_SUPABASE_ANON_KEY")

supabase: sb.Client = sb.create_client(SUPABASE_URL, SUPABASE_KEY)
if supabase:
    print("Connected to Supabase!")
else:
    print("Failed to connect to Supabase.")


# main parser function will read the csv and turn it into badge and activity table entries
def InitializeBadgesAndActivities(scheduleCSV):
    # set empty lists to be filled as we parse
    badgesToInit = []
    activitiesToInit = []

    with open(scheduleCSV, newline="", encoding="utf-8") as f:
        reader = csv.reader(f, skipinitialspace=True)

        for row in reader:
            badge = {} # this dict will becom an insert statement for the merit_badge table
            # skip empty row
            if not any(cell.strip() for cell in row): 
                continue

            #parse line into relevant column values
            name = row[1] #for badge and activity names
            dept = row[3] # badge department
            # parse the period columns
            for i in range(4,10):#columns 5-10 hold the schedule info, but grab column 11 to ensure default case is hit
                activity = {} # this dict will become an insert statement for the activity table
                match row[i]:
                    case 'y': # y indicates the start of a new activity
                        activity["activity_name"] = name
                        activity["periodNumber"] = i - 3
                        activity["duration"] = 1

                    case 'c': # c indicates the continuation of an activity from the previous hour
                        activity["duration"] += 1
                    
                    case _: # default case, previous hour's activiy ended add working activity to list and clear for next activity
                        if(activity): activitiesToInit.append(activity)
                        activity = {}
            # skip badge assigments if non badge activity
            if row[2] != 'x':
                badge["badge_name"] = name
                badge["departmentName"] = dept
                badge["badge_desc", "eagle_badge"] = FetchDescAndEagleStatus()
                badgesToInit.append(badge)
                # send web scraper to init requirements
                FetchReqs(name)

    


# scrapes the scouting website for meritbadge reqs
def FetchReqs():
    return "TODO: write webscraper"

# scrapes the scouting website for merit badge description and eagle status
def FetchDescAndEagleStatus():
    return ("TODO: write webscraper",True)

            


               
            

