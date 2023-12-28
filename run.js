
import GLAutoForwardGmail from "./auto-foward-gmail.js"

const getInputParams = () => {
    var index = 1;
    var argv = (process.argv.slice(2));
    const token = argv[index]
    const profile_id = argv[index+=2]

    return {token: token, profileId: profile_id};
}


var { token, profileId } = getInputParams();
const autoHandler = new GLAutoForwardGmail(token, profileId, "meomapmap11@gmail.com", "@r15v31811", "jinkey.coredev@gmail.com");
console.log(token);
console.log(profileId);

await autoHandler.startScript()