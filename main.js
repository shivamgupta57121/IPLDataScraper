let fs = require("fs");
let path = require("path");
let request = require("request");
let cheerio = require("cheerio");
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results";
request(url, cb);  
function cb(err, response, html){
    if(err) {
        console.log(err);
    } else {
        // console.log(html);
        getMatchPageLink(html);
    }
}
function getMatchPageLink(html){
    let selTool = cheerio.load(html);
    let allMatchElem = selTool(".match-info-link-FIXTURES");
    // console.log(allMatchElem.length);
    for( let i = 0 ; i < allMatchElem.length ; i++){
        let matchLink = selTool(allMatchElem[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com" + matchLink;
        // console.log(fullLink);
        getData(fullLink);
    }
}
function getData(link){
    request(link,cb);
    function cb(err, res, html){
        if(err) {
            console.log(err);
        } else {
            getMatchDetails(html);
        }
    }
}
function getMatchDetails(html){
    let selTool = cheerio.load(html);

    pathOfFolder = path.join(__dirname, "IPL-2020");
    if(fs.existsSync(pathOfFolder) == false){
        fs.mkdirSync(pathOfFolder);
    }

    let dataElem = selTool(".match-info.match-info-MATCH");
    let venueAndDate = selTool(dataElem).find(".description").text().split(",");
    let venue = venueAndDate[1].trim();
    let date = venueAndDate[2].trim();
    let resultElem = selTool(dataElem).find(".status-text");
    let result = selTool(resultElem).text();
    // console.log(venue, date, result);

    let teamElem = selTool(".Collapsible");
    for( let i = 0 ; i < 2 ; i++){
        let team = selTool(teamElem[i]).find("h5.header-title").text();
        let teamName = team.split("(")[0].trim().slice(0, -8);
        let opponent = selTool(teamElem[(i+1)%2]).find("h5.header-title").text();
        let opponentName = opponent.split("(")[0].trim().slice(0, -8);
        // console.log(teamName, opponentName);
        dirCreater(teamName);

        let batsmanElem = selTool(teamElem[i]).find(".table.batsman tbody tr");
        // console.log(batsmanElem.length);

        for( let j = 0 ; j < batsmanElem.length -1 ; j += 2){
            
            let batsmanDataElem = selTool(batsmanElem[j]).find("td");
            // Data needed from batsmanDataElem - 0,2,3,5,6,7
            let batsmanName = selTool(batsmanDataElem[0]).text().trim();
            // console.log(batsmanName);
            let batsmanRun = selTool(batsmanDataElem[2]).text();
            let batsmanBall = selTool(batsmanDataElem[3]).text();
            let batsmanFour = selTool(batsmanDataElem[5]).text();
            let batsmanSix = selTool(batsmanDataElem[6]).text();
            let batsmanSR = selTool(batsmanDataElem[7]).text();
            
            // console.log( batsmanName, batsmanRun, batsmanBall, batsmanFour, batsmanSix,batsmanSR);

            createFile(teamName, batsmanName);
            let pathOfFile = path.join(__dirname, "IPL-2020", teamName, batsmanName + ".json");
            console.log(pathOfFile);
            let content = fs.readFileSync(pathOfFile);
            // let json = JSON.parse(content);
            if(content == ""){
                json = [];
            }
            else{
                json = JSON.parse(content);
            }
            // let json = [];
            json.push({
                runs : batsmanRun,
                ball : batsmanBall,
                fours : batsmanFour,
                sixes : batsmanSix,
                sr : batsmanSR,
                date : date,
                venue : venue,
                result : result,
                opponent : opponentName
            });
            fs.writeFileSync(pathOfFile, JSON.stringify(json));

        }
    }



}
function dirCreater(teamName){
    let pathOfFolder = path.join(__dirname, "IPL-2020", teamName);
    console.log(pathOfFolder);
    if(fs.existsSync(pathOfFolder) == false){
        fs.mkdirSync(pathOfFolder);
    }
}
function createFile(teamName, playerName){
    let pathOfFile = path.join(__dirname, "IPL-2020", teamName, playerName + ".json");
    if(fs.existsSync(pathOfFile) == false){
        var createStream = fs.createWriteStream(pathOfFile);
        createStream.end();
    }
}