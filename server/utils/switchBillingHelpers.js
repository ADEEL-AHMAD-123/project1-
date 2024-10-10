// switchBillingHelpers.js

const moment = require('moment');
const CallSummary = require('../models/CallSummary');
const logger = require('./logger');
const BillingSwitchServer = require('../services/BillingSwitchServer');
const apiKeyInbound = process.env.SWITCH_BILLING_INBOUND_API_KEY;
const apiSecretInbound = process.env.SWITCH_BILLING_INBOUND_API_SECRET;
const apiKeyOutbound = process.env.SWITCH_BILLING_OUTBOUND_API_KEY;
const apiSecretOutbound = process.env.SWITCH_BILLING_OUTBOUND_API_SECRET;

// Initialize servers for inbound and outbound
const inboundServer = new BillingSwitchServer(apiKeyInbound, apiSecretInbound);
const outboundServer = new BillingSwitchServer(apiKeyOutbound, apiSecretOutbound);

// Function to select the appropriate server based on the query type
const getBillingServer = (type) => {
  if (type === 'outbound') {
    return outboundServer;
  }
  // Default to inbound server if type is not specified or is 'inbound'
  return inboundServer;
};

// Helper function to fetch all pages from billing API
const fetchAllPages = async (module, initialPage = 1) => {
  const initialResult = await inboundServer.read(module, initialPage);
  const pages = Math.ceil(initialResult.count / 25);
  let allResults = initialResult.rows;

  for (let i = 2; i <= pages; i++) {
    const result = await inboundServer.read(module, i);
    allResults = allResults.concat(result.rows);
  }

  return allResults;
};

// Helper function to fetch data from MongoDB based on the provided parameters
const fetchDataFromMongoDB = async ({ startDate, endDate, id, skip, limit, page }) => {
  const filter = {};

  if (id) {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      filter.id = numericId;
    }
  }

  if (startDate && endDate) {
    filter.day = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    filter.day = { $gte: startDate };
  } else if (endDate) {
    filter.day = { $lte: endDate };
  }

  const mongodbResults = await CallSummary.find(filter).skip(skip).limit(limit);
  const totalCount = await CallSummary.countDocuments(filter);

  return {
    data: mongodbResults,
    pagination: {
      total: totalCount,
      page: parseInt(page),
      limit: limit,
      totalPages: Math.ceil(totalCount / limit)
    }
  };
};

// Helper function to store data in MongoDB
const storeDataInMongoDB = async (data) => {
  try {
    if (!data) {
      throw new Error('No data to store');
    }

    const records = data.rows.map((record) => ({
      ...record
    }));

    await CallSummary.bulkWrite(
      records.map((record) => ({
        updateOne: {
          filter: { id: record.id, day: record.day },
          update: { $set: record },
          upsert: true
        }
      }))
    );

    logger.info(`Successfully stored ${records.length} records in MongoDB`);

  } catch (err) {
    logger.error(`Failed to store data in MongoDB: ${err.message}`, {
      error: err,
      data: data
    });
    throw new Error(`Failed to store data in MongoDB: ${err.message}`);
  }
};

// Helper function to generate a random pin
const generateRandomPin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit pin
};

module.exports = {
  getBillingServer,
  fetchAllPages,
  fetchDataFromMongoDB,
  storeDataInMongoDB,
  generateRandomPin
};
