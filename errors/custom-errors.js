
function CustomException(message) {
    const error = new Error(message);
    return error;
}
CustomException.prototype = Object.create(Error.prototype);

function AccountDisabledException(message) {
    if (typeof message === "string" && message.length === 0) {
        message = "The account is disabled!"
    }
    else if (message === null) {
        message = "The account is disabled!"
    }

    const error = new Error(message);
    return error;
}
AccountDisabledException.prototype = Object.create(Error.prototype);

function VerifyAccountException(message, verifyType) {
    if (typeof message === "string" && message.length === 0) {
        message = "The account is required to verify"
    }
    else if (message === null) {
        message = "The account is required to verify"
    }

}
VerifyAccountException.prototype = Object.create(Error.prototype);

export { CustomException, AccountDisabledException, VerifyAccountException };  
export default function* () { CustomException };