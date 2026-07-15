const axios = require('axios');
axios.post('http://localhost:8080/api/admin/users', {
  fullName: "Test",
  email: "test500@test.com",
  password: "password123",
  phone: "1234567890",
  role: "CUSTOMER",
  status: "ACTIVE"
}).then(res => console.log("Success:", res.data))
  .catch(err => {
    console.error("Error:", err.response ? err.response.data : err.message);
  });
