from typing import List
from enum import Enum

class TroopType(Enum):
    BTROOP = "BTROOP"
    GTROOP = "GTROOP"
    MTROOP = "MTROOP"



class Requirement(object):

    def __init__(self, rqmt_idnf: str, rqmt_desc: str, requirements: List['Requirement']):
        self.rqmt_idnf = rqmt_idnf
        self.rqmt_desc = rqmt_desc
        self.requirements = requirements
        self.parent_rqmt_id = None
        self.badge_id = None
        self.rqmt_id = None


    @classmethod
    def convert_requirement_from_json(cls, dictionary: dict):
        # Make sure required properties are in description
        if 'rqmt_idnf' in dictionary and 'rqmt_desc' in dictionary:
            #Check for nested requirements
            if 'requirements' in dictionary and dictionary['requirements'] is not None:
                # Recursively convert nested requirements
                requirements = [
                    cls.convert_requirement_from_json(req) for req in dictionary.get('requirements', [])
                ]
            else:
                requirements = []

            return cls(
                rqmt_idnf=dictionary['rqmt_idnf'],
                rqmt_desc=dictionary['rqmt_desc'],
                requirements=requirements
            )
        return None


class MeritBadge(object):

    def __init__(self, badge_name: str, badge_desc: str, eagle_badge: bool, dpmt_name: str, requirements: List[Requirement]):
        self.badge_id = None
        self.badge_name = badge_name
        self.badge_desc = badge_desc
        self.eagle_badge = eagle_badge
        self.dpmt_name = dpmt_name
        self.requirements = requirements

    @classmethod
    def convert_merit_badge_from_json(cls, dictionary: dict):

        #Convert json dictionary to merit badge object
        if 'badge_name' in dictionary and 'badge_desc' in dictionary and 'eagle_badge' in dictionary and 'dpmt_name' in dictionary and 'requirements' in dictionary:
            # Convert the requirements
            requirements = [Requirement.convert_requirement_from_json(req) for req in dictionary.get('requirements', [])]
            return cls(
                badge_name=dictionary['badge_name'],
                badge_desc=dictionary['badge_desc'],
                eagle_badge=dictionary['eagle_badge'],
                dpmt_name=dictionary['dpmt_name'],
                requirements=requirements
            )
        return None


class Scout(object):

    def __init__(self, scout_first_name: str, scout_last_name: str, scout_id: str = None, troop_id: str = None):
        self.scout_id = scout_id
        self.scout_first_name = scout_first_name
        self.scout_last_name = scout_last_name
        self.troop_id = troop_id


    def __eq__(self, other):
        if not isinstance(other, Scout):
            return NotImplemented
        if self.scout_id is not None and other.scout_id is not None:
            return self.scout_id == other.scout_id

        return self.scout_first_name == other.scout_first_name and self.scout_last_name == other.scout_last_name

    def __hash__(self):
        if self.scout_id is not None:
            return hash(self.scout_id)

        return hash((self.scout_first_name, self.scout_last_name, self.troop_id))


class Attendance(object):

    def __init__(self, activity_id: str = None, scout_id: str = None, monday: bool = False, tuesday: bool = False, wednesday: bool = False, thursday: bool = False, friday: bool = False):
        self.activity_id = activity_id
        self.scout_id = scout_id
        self.monday = monday
        self.tuesday = tuesday
        self.wednesday = wednesday
        self.thursday = thursday
        self.friday = friday

    def __eq__(self, other):
        if not isinstance(other, Attendance):
            return NotImplemented
        if self.activity_id is not None and other.activity_id is not None and self.scout_id is not None and other.scout_id is not None:
            return self.activity_id == other.activity_id and self.scout_id == other.scout_id
        return False


class Troop(object):

    def __init__(self, troop_nmbr: str, troop_council: str, troop_phone_nmbr: str, troop_email: str, troop_type: TroopType, troop_city: str, troop_state:str, troop_id: str = None, scouts: set = None):
        self.troop_id = troop_id
        self.troop_nmbr = troop_nmbr
        self.troop_council = troop_council
        self.troop_phone_nmbr = troop_phone_nmbr
        self.troop_email = troop_email
        self.troop_type = troop_type
        self.troop_city = troop_city
        self.troop_state = troop_state
        if scouts is None:
            self.scouts = set()

    def __eq__(self, other):
        if not isinstance(other, Troop):
            return NotImplemented
        if self.troop_id is not None and other.troop_id is not None:
            return self.troop_id == other.troop_id

        return self.troop_nmbr == other.troop_nmbr and self.troop_type == other.troop_type and self.troop_council == other.troop_council

    def __hash__(self):
        if self.troop_id is not None:
            return hash(self.troop_id)

        return hash((self.troop_nmbr, self.troop_type, self.troop_council))


class ScoutBadge(object):

    def __init__(self, completed: bool, badge_id: str, scout_id: str, scout_badge_id: str = None, signed_by_id: str = None):
        self.scout_badge_id = scout_badge_id
        self.badge_id = badge_id
        self.scout_id = scout_id
        self.completed = completed
        self.signed_by_id = signed_by_id

    def __eq__(self, other):
        if not isinstance(other, ScoutBadge):
            return NotImplemented
        if self.scout_badge_id is not None and other.scout_badge_id is not None:
            return self.scout_badge_id == other.scout_badge_id

        return self.scout_id == other.scout_id and self.badge_id == other.badge_id

    def __hash__(self):
        if self.scout_badge_id:
            return hash(self.scout_badge_id)

        return hash((self.scout_id, self.badge_id))


class ScoutRequirement(object):

    def __init__(self, completed: bool, rqmt_id: str, scout_badge_id: str, signed_by_id: str = None, scout_badge_rqmt_id: str = None):
        self.scout_badge_rqmt_id = scout_badge_rqmt_id
        self.scout_badge_id = scout_badge_id
        self.rqmt_id = rqmt_id
        self.completed = completed
        self.signed_by_id = signed_by_id

    def __eq__(self, other):
        if not isinstance(other, ScoutRequirement):
            return NotImplemented
        if self.scout_badge_rqmt_id is not None and other.scout_badge_rqmt_id is not None:
            return self.scout_badge_rqmt_id == other.scout_badge_rqmt_id

        return self.scout_badge_id == other.scout_badge_id and self.rqmt_id == other.rqmt_id

    def __hash__(self):

        if self.scout_badge_rqmt_id is not None:
            return hash(self.scout_badge_rqmt_id)

        return hash((self.scout_badge_id, self.rqmt_id))
