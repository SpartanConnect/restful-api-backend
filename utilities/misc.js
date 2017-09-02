var verbosity = process.env.VERBOSITY || 1;

/**
 * A function that prints out an error depending on the specified verbosity level.
 * @param {string} message The message that is printed to the console (as an error)
 * @param {number} verbosityLevel A number indicating the level of verbosity that the statement should begin to be printed at.
 */
module.exports.e = (message, verbosityLevel) => {
    if (verbosity >= verbosityLevel) {
        console.error(message);
    }
};

/**
 * A function that prints out an log depending on the specified verbosity level.
 * @param {string} message The message that is printed to the console (as a log)
 * @param {number} verbosityLevel A number indicating the level of verbosity that the statement should begin to be printed at.
 */
module.exports.l = (message, verbosityLevel) => {
    if (verbosity >= verbosityLevel) {
        console.log(message);
    }
};

/**
 * A function that prints out info depending on the specified verbosity level.
 * @param {string} message The message that is printed to the console (as info)
 * @param {number} verbosityLevel A number indicating the level of verbosity that the statement should begin to be printed at.
 */
module.exports.i = (message, verbosityLevel) => {
    if (verbosity >= verbosityLevel) {
        console.info(message);
    }
};

/**
 * A function that prints out a warning depending on the specified verbosity level.
 * @param {string} message The message that is printed to the console (as a warning)
 * @param {number} verbosityLevel A number indicating the level of verbosity that the statement should begin to be printed at.
 */
module.exports.w = (message, verbosityLevel) => {
    if (verbosity >= verbosityLevel) {
        console.warn(message);
    }
};