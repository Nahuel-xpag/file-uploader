const fs = require('fs');
const path = require('node:path');

function main(){
    fs.mkdirSync(path.join(__dirname, "userFiles", "test"), {recursive: true}, (err) => {
        if(err) throw err;
    });
}
main()