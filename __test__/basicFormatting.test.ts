describe('basicFormatting', () => {
    it('formats full names correctly', () => {
      const firstName = 'Auggie';
      const lastName = 'Neff';
  
      const fullName = `${firstName} ${lastName}`;
      expect(fullName).toBe('Auggie Neff');
    });
  
    it('formats email to lowercase', () => {
      const email = 'TEST@EXAMPLE.COM';
      expect(email.toLowerCase()).toBe('test@example.com');
    });
  
    it('trims extra whitespace from names', () => {
      const name = '  Camp Geiger  ';
      expect(name.trim()).toBe('Camp Geiger');
    });
  
    it('formats role labels correctly', () => {
      const role = 'areaDirector';
      const label = role === 'areaDirector' ? 'Area Director' : role;
      expect(label).toBe('Area Director');
    });
  });