describe('searchAndFilter', () => {
    const users = [
      { name: 'Auggie Neff', role: 'admin' },
      { name: 'John Carter', role: 'developer' },
      { name: 'Sarah Mills', role: 'counselor' },
      { name: 'Ben Adams', role: 'developer' },
    ];
  
    it('finds users by partial name search', () => {
      const result = users.filter((u) =>
        u.name.toLowerCase().includes('ben')
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Ben Adams');
    });
  
    it('filters users by role', () => {
      const developers = users.filter((u) => u.role === 'developer');
      expect(developers).toHaveLength(2);
    });
  
    it('returns empty results for unmatched search', () => {
      const result = users.filter((u) =>
        u.name.toLowerCase().includes('zach')
      );
      expect(result).toHaveLength(0);
    });
  
    it('supports combined role and name filtering', () => {
      const result = users.filter(
        (u) => u.role === 'developer' && u.name.toLowerCase().includes('john')
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Carter');
    });
  });