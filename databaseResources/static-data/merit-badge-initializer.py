import json as js
import os
import sys

import supabase as sb
from dotenv import load_dotenv
import glob

from supabase import Client

from meritBadge import MeritBadge, Requirement

from postgrest import APIError


# def insert_merit_badge(dpmt_name: str, )

count = 0

def print_all_requirements(requirements: [Requirement], indent: str):
    for requirement in requirements:
        print(f"{indent}RQMT_IDNF: {requirement.rqmt_idnf}\n{indent}RQMT_DESC: {requirement.rqmt_desc}")
        global count
        count += 1
        if(requirement.requirements is not None and len(requirement.requirements) > 0):
            print_all_requirements(requirement.requirements, f"{indent}\t")


def add_merit_badges_by_dpmt(departments_with_merit_badges: dict[str, [MeritBadge]], sb: Client):
    for department in departments_with_merit_badges.keys():
        dpmt_id = (sb.table("camp_dpmt")
                    .select("dpmt_id")
                    .ilike("dpmt_name", department)
                    .maybe_single()
                    .execute().data["dpmt_id"])

        print(dpmt_id)

        for merit_badge in departments_with_merit_badges[department]:
            try:
                new_merit_badge = {"badge_name": merit_badge.badge_name, "badge_desc": merit_badge.badge_desc, "eagle_badge": merit_badge.eagle_badge, "dpmt_id": dpmt_id}
                data = supabase.table("merit_badge").insert(new_merit_badge).execute().data

                if data is not None:
                    merit_badge_id = data[0]["badge_id"]
                    merit_badge.badge_id = merit_badge_id

                    insert_merit_badge_requirements_recursively(merit_badge_id, merit_badge.requirements, None)

            except APIError as api:
                print(f"API ERROR DETECTED: {api.message}", file=sys.stderr)
            except Exception as e:
                print(f"GENERAL ERROR DETECTED: {e}", file=sys.stderr)

def insert_merit_badge_requirements_recursively(badge_id: str, requirements: [Requirement],parent_rqmt_id: str):

    for requirement in requirements:
        try:
            requirement.badge_id = badge_id
            new_requirement = {"badge_id": badge_id, "rqmt_desc": requirement.rqmt_desc,
                               "rqmt_idnf": requirement.rqmt_idnf}
            if parent_rqmt_id is not None:
                new_requirement["parent_rqmt_id"] = parent_rqmt_id
            data = supabase.table("merit_badge_rqmt").insert(new_requirement).execute().data
            if data is not None:
                rqmt_id = data[0]["rqmt_id"]
                requirement.rqmt_id = rqmt_id
                if requirement.requirements is not None and len(requirement.requirements) > 0:
                    insert_merit_badge_requirements_recursively(badge_id, requirement.requirements, rqmt_id)

        except APIError as api:
            print(f"API ERROR DETECTED: {api.message}", file=sys.stderr)
        except Exception as e:
            print(f"GENERAL ERROR DETECTED: {e}", file=sys.stderr)




# Load environment variables from a .env file (optional, but recommended)
load_dotenv()

SUPABASE_URL = os.environ.get("EXPO_PUBLIC_SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("EXPO_PUBLIC_SUPABASE_ANON_KEY", "YOUR_SUPABASE_ANON_KEY")


supabase: sb.Client = sb.create_client(SUPABASE_URL, SUPABASE_KEY)

if supabase:
    print("Connected to Supabase!")
else:
    print("Failed to connect to Supabase.")


department_folders = [folder for folder in glob.glob("./merit-badges/*") if os.path.isdir(folder)]

merit_badge_files = [(os.path.basename(folder.rstrip('/\\')).upper(), file)
                     for folder in department_folders
                     for file in glob.glob(os.path.join(folder, "*.json"))]

print(department_folders)

print(merit_badge_files)

merit_badges = []
departments_with_merit_badges_out = {}

for department,file in merit_badge_files:
    with open(file, "r") as open_file:
        data = js.load(open_file)
        merit_badge = MeritBadge.convert_merit_badge_from_json(data)
        if merit_badge:
            departments_with_merit_badges_out.setdefault(merit_badge.dpmt_name.upper(), []).append(merit_badge)


print(departments_with_merit_badges_out)



for merit_badge_list in departments_with_merit_badges_out.values():
    for MeritBadge in merit_badge_list:
        print(MeritBadge.badge_name)
        print(MeritBadge.badge_desc)
        print(MeritBadge.eagle_badge)
        print(MeritBadge.dpmt_name)
        print_all_requirements(MeritBadge.requirements, "\t")
# add_merit_badges_by_dpmt(departments_with_merit_badges_out, supabase)