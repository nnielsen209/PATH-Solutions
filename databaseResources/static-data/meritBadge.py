from typing import List

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