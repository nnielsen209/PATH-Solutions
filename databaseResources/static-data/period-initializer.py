import json as js
import os
import sys

import supabase as sb
from dotenv import load_dotenv

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

new_period = {"period_nmbr": 1, "period_time": "9:00 AM"}
data = supabase.table("period").insert(new_period).execute().data
print(data)
new_period = {"period_nmbr": 2, "period_time": "10:00 AM"}
data = supabase.table("period").insert(new_period).execute().data
print(data)
new_period = {"period_nmbr": 3, "period_time": "11:00 AM"}
data = supabase.table("period").insert(new_period).execute().data
print(data)
new_period = {"period_nmbr": 4, "period_time": "2:30 PM"}
data = supabase.table("period").insert(new_period).execute().data
print(data)
new_period = {"period_nmbr": 5, "period_time": "3:30 PM"}
data = supabase.table("period").insert(new_period).execute().data
print(data)
new_period = {"period_nmbr": 6, "period_time": "4:30 PM"}
data = supabase.table("period").insert(new_period).execute().data
print(data)