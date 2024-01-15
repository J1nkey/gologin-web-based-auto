
function CustomException(message) {
    const error = new Error(message);
    return error;
}
CustomException.prototype = Object.create(Error.prototype);

function AccountDisabledException(message = 'The account is disabled!') {
    if (message === null) {
        message = "The account is disabled!"
    }

    const error = new Error(message);
    return error;
}
AccountDisabledException.prototype = Object.create(Error.prototype);

function VerifyAccountException(message = 'The account is required to verify') {
    if (message === null) {
        message = "The account is required to verify"
    }
    const error = new Error(message);
    return error;
}
VerifyAccountException.prototype = Object.create(Error.prototype);

function PasswordChangedException(message = 'The password of account was changed before') {
    if(message === null) {
        message = 'The password of account was changed before';
    }

    const error = new Error(message);
    return error;
}
PasswordChangedException.prototype = Object.create(Error.prototype);

export { CustomException, AccountDisabledException, VerifyAccountException, PasswordChangedException };  
export default function* () { CustomException };