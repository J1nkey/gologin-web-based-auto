import GoLogin from "./src/gologin.js";
class GoLoginBroker {
    constructor(token, profileId) {
        this._token = token;
        this._profileId = profileId
    }

    async openConnectionAsync() {
        const GL = new GoLogin({token: this._token, profile_id: this._profileId});

        const { status, wsUrl } = await GL.start().catch((e) => {
            console.trace(e);
            return { isSuccess: false, status: 'failure', message: e };
        });
    
        if (status !== 'success') {
            console.log('Invalid status');
            return { isSuccess: false, status: 'failure', message: 'Could not connect to GoLogin, invalid status is happened'};
        }

        return {isSuccess: true, status: status, wsUrl: wsUrl};
    }
}

export default GoLoginBroker;