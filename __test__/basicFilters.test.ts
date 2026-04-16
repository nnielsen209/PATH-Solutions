describe('basicFilters', () => {
    it('filters active programs correctly', () => {
      const programs = [
        { name: 'Archery', active: true },
        { name: 'Swimming', active: false },
        { name: 'Camping', active: true },
      ];
  
      const activePrograms = programs.filter((p) => p.active);
      expect(activePrograms).toHaveLength(2);
    });
  
    it('filters inactive programs correctly', () => {
      const programs = [
        { name: 'Archery', active: true },
        { name: 'Swimming', active: false },
        { name: 'Camping', active: false },
      ];
  
      const inactivePrograms = programs.filter((p) => !p.active);
      expect(inactivePrograms).toHaveLength(2);
    });
  
    it('filters campers by troop correctly', () => {
      const campers = [
        { name: 'A', troop: '101' },
        { name: 'B', troop: '202' },
        { name: 'C', troop: '101' },
      ];
  
      const troop101 = campers.filter((c) => c.troop === '101');
      expect(troop101).toHaveLength(2);
    });
  
    it('filters leaders correctly', () => {
      const people = [
        { name: 'Leader 1', type: 'leader' },
        { name: 'Camper 1', type: 'camper' },
        { name: 'Leader 2', type: 'leader' },
      ];
  
      const leaders = people.filter((p) => p.type === 'leader');
      expect(leaders).toHaveLength(2);
    });
  });