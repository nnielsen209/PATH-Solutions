describe('basicCounts', () => {
    it('counts admin users correctly', () => {
      const users = [
        { role: 'admin' },
        { role: 'developer' },
        { role: 'admin' },
        { role: 'counselor' },
      ];
  
      const admins = users.filter((u) => u.role === 'admin').length;
      expect(admins).toBe(2);
    });
  
    it('counts developer users correctly', () => {
      const users = [
        { role: 'developer' },
        { role: 'developer' },
        { role: 'admin' },
      ];
  
      const developers = users.filter((u) => u.role === 'developer').length;
      expect(developers).toBe(2);
    });
  
    it('counts counselor users correctly', () => {
      const users = [
        { role: 'counselor' },
        { role: 'admin' },
        { role: 'counselor' },
        { role: 'counselor' },
      ];
  
      const counselors = users.filter((u) => u.role === 'counselor').length;
      expect(counselors).toBe(3);
    });
  
    it('counts total users correctly', () => {
      const users = [
        { role: 'admin' },
        { role: 'developer' },
        { role: 'counselor' },
        { role: 'leader' },
        { role: 'camper' },
      ];
  
      expect(users.length).toBe(5);
    });
  });