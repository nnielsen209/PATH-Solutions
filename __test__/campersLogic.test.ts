describe('campersLogic', () => {
    const campers = [
      { name: 'Alex', troop: '101', leader: false },
      { name: 'Ben', troop: '202', leader: false },
      { name: 'Chris', troop: '101', leader: false },
      { name: 'Mr. Smith', troop: '101', leader: true },
      { name: 'Mrs. Jones', troop: '202', leader: true },
    ];
  
    it('counts campers in troop 101', () => {
      const troop101 = campers.filter((c) => c.troop === '101' && !c.leader);
      expect(troop101).toHaveLength(2);
    });
  
    it('counts leaders correctly', () => {
      const leaders = campers.filter((c) => c.leader);
      expect(leaders).toHaveLength(2);
    });
  
    it('counts total people in troop 202', () => {
      const troop202 = campers.filter((c) => c.troop === '202');
      expect(troop202).toHaveLength(2);
    });
  
    it('returns no campers for missing troop', () => {
      const troop999 = campers.filter((c) => c.troop === '999');
      expect(troop999).toHaveLength(0);
    });
  });