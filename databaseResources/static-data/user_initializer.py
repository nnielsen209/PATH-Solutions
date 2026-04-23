import os
import csv
import re
import us
import sys

import supabase as sb
from dotenv import load_dotenv

from supabase import Client

from database_objects import Scout, Troop, TroopType

from postgrest import APIError

import time


def getTroopType(troopQualifier: str) -> TroopType:

    match troopQualifier:
        case "Boy":
            return TroopType.BTROOP
        case "Girl":
            return TroopType.GTROOP
        case "Mixed":
            return TroopType.MTROOP
        case _:
            return TroopType.BTROOP

def clean_str(value):
    return value.strip() if value and value.strip() else ""

def safe_state_lookup(value):
    if not value:
        return ""
    try:
        result = us.states.lookup(value)
        return result.abbr if result else ""
    except Exception:
        return ""



def insertScoutDataByTroop(scouts: [Scout], troop_id: str, troop_nmbr: str):

    scout_insert_data = [
        {"scout_first_name": scout.scout_first_name, "scout_last_name": scout.scout_last_name,
         "troop_id": troop_id}
        for scout in scouts
    ]

    data = supabase.table("scout").insert(scout_insert_data).execute().data

    if data is not None:

        print(f"Scouts added successfully for troop: {troop_id}")

        for scout in data:

            scout_id = scout["scout_id"]

            scout_idnf = scout["scout_first_name"] + " " + scout["scout_last_name"] + " " + troop_nmbr

            insertScoutBadgesAndRequirements(scout_id, scout_idnf)

            insertScoutActivities(scout_id, scout_idnf)


def insertScoutBadgesAndRequirements(scout_id: str, scout_idnf: str):

    badges = scoutBadges.get(scout_idnf, [])

    if badges:
        badge_insert_data = [
            {"badge_id": badge_ids[badge], "scout_id": scout_id}
            for badge in badges
        ]

        data = supabase.table("scout_badge").insert(badge_insert_data).execute().data

        if data is not None:
            print(f"Scout Badges Successfully Added for Scout: {scout_id}")

            requirement_inserts = []

            for badge in data:
                badge_id = badge["badge_id"]
                scout_badge_id = badge["scout_badge_id"]

                for requirement in badge_requirements.get(badge_id, []):
                    requirement_inserts.append({
                        "scout_badge_id": scout_badge_id,
                        "rqmt_id": requirement
                    })

            if requirement_inserts:
                data = supabase.table("scout_badge_rqmt").insert(requirement_inserts).execute().data

                if data is not None:
                    print("Requirements added successfully")


def insertScoutActivities(scout_id: str, scout_idnf: str):

    activities = scoutActivities.get(scout_idnf, [])

    scout_attendance_insert_data = [
        {"scout_id": scout_id,
         "activity_id": activity_ids[activity]}
        for activity in activities
        if activity_ids.get(activity) is not None
    ]

    if not scout_attendance_insert_data:
        return

    data = supabase.table("attendance").insert(scout_attendance_insert_data).execute().data

    if data is not None:
        print(f"Attendance added successfully for scout: {scout_id}")





# Load environment variables from a .env file (optional, but recommended)
load_dotenv()

SUPABASE_URL = os.environ.get("EXPO_PUBLIC_SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "YOUR_SUPABASE_ANON_KEY")


supabase: sb.Client = sb.create_client(SUPABASE_URL, SUPABASE_KEY)

if supabase:
    print("Connected to Supabase!")
else:
    print("Failed to connect to Supabase.")


userRegistrationFile = "./Class_Roster_85021.csv"

if sys.argv[1] is not None and len(sys.argv[1]) > 0:
    userRegistrationFile = sys.argv[1]


userRegistrationRows = []
troopRegistrationRows = []

with open(userRegistrationFile, newline="", encoding="utf-8") as f:
    reader = csv.reader(f)

    count = 0
    for row in reader:
        count += 1
        userRegistrationRows.append(row)

    # print(count)



testRows = userRegistrationRows[0:300]

scouts = set()

scoutBadges = {}

scoutActivities = {}

troops = {}

badge_data = supabase.table("merit_badge").select("*").execute().data
badge_ids = {}
for badge in badge_data:
    badge_ids[badge["badge_name"]] = badge["badge_id"]

for row in userRegistrationRows:

    if row[0] == "Catalog Name":
        continue # Skip the first row


    scout = Scout(row[19], row[18])
    scouts.add(scout)

    state = safe_state_lookup(row[26])
    city = clean_str(row[25])
    troop_type = getTroopType(row[31])
    council = row[27]
    troop_nmbr = row[30]

    troopKey = (troop_nmbr, council, troop_type)

    if troopKey not in troops:
        troops[troopKey] = Troop(troop_nmbr, council, None, row[23], troop_type, city, state)

    troop = troops[troopKey]

    if not troop.troop_city:
        troop.troop_city = city

    if not troop.troop_state:
        troop.troop_state = state

    if not troop.troop_email:
        troop.troop_email = row[23]

    troop.scouts.add(scout)

    scout_idnf = scout.scout_first_name + " " + scout.scout_last_name + " " + troop.troop_nmbr

    if row[32] != '' and row[32] in badge_ids.keys(): # Make sure badge is in database
        # Normalize to match database
        meritBadge = re.sub(r'\([^)]*\)', "", re.sub(r'-First Year Camper Experience', "", row[32]))
        scoutBadges.setdefault(scout_idnf, set()).add(meritBadge)

    # Normalize to match database
    activity = re.sub(r'\([^)]*\)', "", re.sub(r'-First Year Camper Experience', "", row[2]))
    if ',' in activity and 'Signs' not in activity:
        activities = [result.strip() for result in activity.split(',')]
        activity = "; ".join(activities)

    activity_name = re.sub(r'\([^)]*\)', "", activity).strip()
    activity_period = int(''.join(c for c in row[3] if c.isdigit()))
    scoutActivities.setdefault(scout_idnf, set()).add((activity_name, activity_period))

# for key in scoutActivities.keys():
#     print(f"{key}: {scoutActivities[key]}")

# print(len(scouts))
# print(len(scoutBadges))
# print(len(scoutActivities))
# print(len(troops))

activity_ids = {}

activity_data = supabase.table("activity").select("*, period(*)").execute().data


for activity in activity_data:
    activity_ids[(activity["activity_name"], activity["period"]["period_nmbr"])] = activity["activity_id"]


# print(activity_ids)
# print(scoutActivities)

badge_requirements = {}
badge_requirement_data = []
offset = 0

while True:
    # configure offset and use order to ensure consistent results
    temp_data = (supabase
                 .table("merit_badge_rqmt")
                 .select("*")
                 .range(offset, offset + 1000)
                 .order("badge_id", desc=True)
                 .execute().data)
    badge_requirement_data.extend(temp_data)
    offset += 1000
    if len(temp_data) != 1000: # Not full, reached end of list
        break


for requirement in badge_requirement_data:
    badge_requirements.setdefault(requirement["badge_id"], []).append(requirement["rqmt_id"])

start_time = time.time()

troop_insert_data = [
    {
        "troop_nmbr": troop.troop_nmbr,
        "troop_email": troop.troop_email,
        "troop_type": troop.troop_type.value,
        "troop_city": troop.troop_city,
        "troop_state": troop.troop_state,
        "troop_council": troop.troop_council
    }
    for troop in troops.values()
]

data = supabase.table("troop").insert(troop_insert_data).execute().data

troop_lookup = {
    (troop.troop_nmbr, troop.troop_state, troop.troop_type.value): troop
    for troop in troops.values()
}

if data is not None:
    print("Troop data inserted!")

    for row in data:
        key = (str(row["troop_nmbr"]), row["troop_state"], row["troop_type"])
        if key in troop_lookup:
            troop_lookup[key].troop_id = row["troop_id"]

for troop in troops.values():
    if troop.troop_id is None:
        print("Troop not found!")
        print(troop.troop_nmbr, troop.troop_state, troop.troop_type.value)

for troop in troops.values():

    insertScoutDataByTroop(troop.scouts, troop.troop_id, troop.troop_nmbr)


print("--- %s seconds ---" % (time.time() - start_time))