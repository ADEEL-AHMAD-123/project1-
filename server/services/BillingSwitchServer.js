// services/BillingSwitchServer.js

const axios = require('axios');
const crypto = require('crypto');

class BillingSwitchServer {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.publicUrl = 'http://65.108.146.238/mbilling'; // Adjust this URL as needed
  }

  generateNonce() {
    const mt = process.hrtime();
    return mt[1] + Math.floor(Math.random() * 1000000);
  }

  generateSignature(postData) {
    return crypto.createHmac('sha512', this.apiSecret).update(postData).digest('hex');
  }

  async query(req) {
    try {
      const nonce = this.generateNonce();
      req.nonce = nonce;
      
      // Generate the POST data string
      const postData = new URLSearchParams(req).toString();
      
      // Generate the signature
      const sign = this.generateSignature(postData);
      
      // Generate the headers
      const headers = {
        'Key': this.apiKey,
        'Sign': sign
      };
      
      const url = `${this.publicUrl}/index.php/${req.module}/${req.action}`;
      
      // Make the request
      const response = await axios.post(url, postData, { headers });
      
      console.log('generated url : ',url);
      return response.data;
    } catch (error) {
    return error
    }
  }

  async create(module, data = {}, action = 'save') {
    data.module = module;
    data.action = action;
    data.id = 0; // Default ID
    return this.query(data);
  }

  async update(module, id, data) {
    data.module = module;
    data.action = 'save';
    data.id = id;
    return this.query(data);
  }

  async destroy(module, id) {
    return this.query({
      module: module,
      action: 'destroy',
      id: id
    });
  }

  async read(module, page = 1, action = 'read') {
    return this.query({
      module: module,
      action: action,
      page: page,
      start: page === 1 ? 0 : (page - 1) * 25,
      limit: 25,
      filter: JSON.stringify(this.filter) 
    }); 
  }
}

module.exports = BillingSwitchServer; 
