import axios from 'axios';

const registerAdmin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register-admin', {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      adminKey: 'NEURA_ADMIN_2024' // Using a different admin key
    });
    console.log('Admin account created successfully:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('Error:', error.message);
    }
  }
};

registerAdmin(); 