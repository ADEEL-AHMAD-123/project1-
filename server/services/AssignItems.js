const DID = require('../models/DID');
const Server = require('../models/server'); // Assuming you have a server model
const createError = require('http-errors');
const logger = require('../utils/logger');

// Function to assign DID to a user after payment
const assignDIDToUser = async (userId, didId) => {
  try {
    const did = await DID.findById(didId);

    if (!did) {
      logger.error(`DID not found: ${didId}`, { userId });
      throw createError(404, 'DID not found');
    }

    if (did.status !== 'available') {
      logger.error(`DID is not available for assignment: ${didId}`, { userId });
      throw createError(400, 'DID is not available for assignment');
    }

    // Assign the DID to the user
    did.assignedTo = userId;
    did.status = 'purchased';
    await did.save();

    logger.info(`DID ${did.didNumber} assigned to user ${userId}`);
    return did;
  } catch (error) {
    logger.error(`Failed to assign DID ${didId} to user ${userId}: ${error.message}`);
    throw error;
  }
};

// Function to assign Server to a user after payment
const assignServerToUser = async (userId, serverId) => {
  try {
    const server = await Server.findById(serverId);

    if (!server) {
      logger.error(`Server not found: ${serverId}`, { userId });
      throw createError(404, 'Server not found');
    }

    if (server.status !== 'available') {
      logger.error(`Server is not available for assignment: ${serverId}`, { userId });
      throw createError(400, 'Server is not available for assignment');
    }

    // Assign the server to the user
    server.userId = userId;
    server.status = 'purchased';
    await server.save();

    logger.info(`Server ${server._id} assigned to user ${userId}`, { userId, serverId });
    return server;
  } catch (error) {
    logger.error(`Failed to assign server ${serverId} to user ${userId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  assignDIDToUser,
  assignServerToUser,
};
