describe('programLogic', () => {
    const programs = [
      { name: 'Archery', active: true, area: 'Shooting Sports' },
      { name: 'Swimming', active: false, area: 'Aquatics' },
      { name: 'Camping', active: true, area: 'Outdoor Skills' },
      { name: 'First Aid', active: true, area: 'Health' },
    ];
  
    it('counts active programs correctly', () => {
      const activePrograms = programs.filter((p) => p.active);
      expect(activePrograms).toHaveLength(3);
    });
  
    it('counts inactive programs correctly', () => {
      const inactivePrograms = programs.filter((p) => !p.active);
      expect(inactivePrograms).toHaveLength(1);
    });
  
    it('filters programs by area', () => {
      const aquaticsPrograms = programs.filter((p) => p.area === 'Aquatics');
      expect(aquaticsPrograms).toHaveLength(1);
      expect(aquaticsPrograms[0].name).toBe('Swimming');
    });
  
    it('sorts programs alphabetically', () => {
      const sorted = [...programs].sort((a, b) => a.name.localeCompare(b.name));
      expect(sorted.map((p) => p.name)).toEqual([
        'Archery',
        'Camping',
        'First Aid',
        'Swimming',
      ]);
    });
  });