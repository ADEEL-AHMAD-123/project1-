const axios = require('axios');
const crypto = require('crypto');

class BillingSwitchServer {
  constructor(apiKey, apiSecret) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.publicUrl = 'http://65.108.146.238/mbilling'; 
    this.filter = []; // Initialize filter array
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
        'key': this.apiKey,
        'sign': sign
      };
      
      const url = `${this.publicUrl}/index.php/${req.module}/${req.action}`;
      
      console.log('API Request:', { url, postData, headers });

      const response = await axios.post(url, postData, { headers });
      
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in BillingSwitchServer query:', error.message);
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

  clearFilter() {
    this.filter = [];
  }

  setFilter(field, value, comparison = 'st', type = 'string') {
    this.filter.push({
      type,
      field,
      value,
      comparison
    });
  }

  async getId(module, field, value) {
    this.setFilter(field, value, 'eq');
    const query = await this.query({
      module,
      action: 'read',
      page: 1,
      start: 0,
      limit: 1,
      filter: JSON.stringify(this.filter)
    });

    this.clearFilter();

    if (query.rows && query.rows[0]) {
      return query.rows[0].id;
    }
    return null;
  }
}

module.exports = BillingSwitchServer;
