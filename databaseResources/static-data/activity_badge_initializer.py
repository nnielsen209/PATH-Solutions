import os
from warnings import catch_warnings

import supabase as sb
from dotenv import load_dotenv

from supabase import Client

from database_objects import Scout, Troop, TroopType

from postgrest import APIError



# Load environment variables from a .env file (optional, but recommended)
load_dotenv()

SUPABASE_URL = os.environ.get("EXPO_PUBLIC_SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "YOUR_SUPABASE_ANON_KEY")


supabase: sb.Client = sb.create_client(SUPABASE_URL, SUPABASE_KEY)

if supabase:
    print("Connected to Supabase!")
else:
    print("Failed to connect to Supabase.")


badge_data = supabase.table("merit_badge").select("*").execute().data
badge_ids = {}
for badge in badge_data:
    badge_ids[badge["badge_name"]] = badge["badge_id"]


activity_ids = {}
activity_data = supabase.table("activity").select("*").execute().data
for activity in activity_data:
    activity_ids[activity["activity_id"]] = activity["activity_name"]


for activity in activity_ids.keys():

    if ';' in activity_ids[activity]:

        badges = [badge.strip() for badge in activity_ids[activity].split(';')]

        for badge in badges:

            if badge in badge_ids.keys():

                new_activity_badge = {"activity_id": activity, "badge_id": badge_ids[badge]}
                data = supabase.table("activity_badge").insert(new_activity_badge).execute().data

                if data is not None:
                    print("Activity Badge Added Successfully!")

    elif activity_ids[activity] in badge_ids.keys():

        new_activity_badge = {"activity_id": activity, "badge_id": badge_ids[activity_ids[activity]]}
        data = supabase.table("activity_badge").insert(new_activity_badge).execute().data

        if data is not None:
            print("Activity Badge Added Successfully!")