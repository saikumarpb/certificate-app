export function generateUniqueCertificateId(length: number) {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      id += charset.charAt(randomIndex);
    }
  
    return id;
  }