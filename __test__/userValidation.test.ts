describe('userValidation', () => {
    const isValidName = (name: string) => name.trim().length > 0;
    const isValidEmail = (email: string) =>
      email.includes('@') && email.includes('.');
    const isValidRole = (role: string) =>
      ['admin', 'developer', 'counselor', 'leader', 'camper'].includes(role);
  
    it('accepts a valid name', () => {
      expect(isValidName('Auggie Neff')).toBe(true);
    });
  
    it('rejects an empty name', () => {
      expect(isValidName('   ')).toBe(false);
    });
  
    it('accepts a valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });
  
    it('rejects an invalid email', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });
  
    it('accepts a valid role', () => {
      expect(isValidRole('admin')).toBe(true);
    });
  
    it('rejects an invalid role', () => {
      expect(isValidRole('superuser')).toBe(false);
    });
  });