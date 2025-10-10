const { STATUS_CODES } = require("../constants/statusCodes");
const { GENERAL_RESPONSE_MESSAGE } = require("../constants/responseMessages");

exports.errorHandler = (err, req, res, next) => {
  res
    .status(STATUS_CODES.SERVER_ERROR)
    .json({ error: GENERAL_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR });
};
