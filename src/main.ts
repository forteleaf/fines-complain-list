import * as cheerio from 'cheerio';
import axios from 'axios';
import * as Iconv from 'iconv-lite';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

let dataSet: Lmt[] = [];
let endCount: number = 195;

interface Lmt {
    no: string;
    coNo: string;
    coNm: string;
    desc: string;
    registDate: string;
    coNoOwner: string;
    addr: string;
    tel: string;
    homepage: string;
}

function getData(number: number) {
    let requestUrl = `https://fine.fss.or.kr/main/fin_comp/similar/business_list.jsp?page=${number}`;
    let mapData: Lmt;

    return axios({
        url: requestUrl,
        method: 'GET',
        responseType: 'arraybuffer',
    }).then((res) => {
        const $ = cheerio.load(Iconv.decode(res.data, 'euc-kr'));
        console.log(`${number} length: ${res.data.length} bytes`);
        $('.tb_cont > tbody > tr').map(function (
            i: number,
            element: cheerio.Element
        ) {
            mapData = {
                no: String($(element).find('td:nth-of-type(2)').text()),
                coNo: String($(element).find('td:nth-of-type(2)').text()),
                coNm: String($(element).find('td:nth-of-type(3)').text()),
                desc: String($(element).find('td:nth-of-type(4)').text()),
                registDate: String($(element).find('td:nth-of-type(5)').text()),
                coNoOwner: String($(element).find('td:nth-of-type(6)').text()),
                addr: String(
                    $(element)
                        .find('td:nth-of-type(7)')
                        .text()
                        .replace(/\n|\t/g, '')
                ),
                tel: String(
                    $(element)
                        .find('td:nth-of-type(8)')
                        .text()
                        .replace(/\n|\t/g, '')
                ),
                homepage: String(
                    $(element)
                        .find('td:nth-of-type(9)')
                        .text()
                        .replace(/\n|\t/g, '')
                ),
            };
            addDataset(mapData);
            fs.appendFileSync('data.json', JSON.stringify(mapData));
            fs.appendFileSync('data.json', ',');
        });
    });
}

async function getDatas() {
    for (let i = 1; i <= endCount; i++) {
        await getData(i);
    }
    console.log('end');
    makeExcel(dataSet);
}
function addDataset(data: Lmt) {
    dataSet.push(data);
}

/**
 * export excel file from json
 * @param data 엑셀 파일
 */
function makeExcel(data: any[]) {
    let worksheet = XLSX.utils.json_to_sheet(data);
    let workbook = XLSX.utils.book_new();
    let fileName = 'data.xlsx';
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.writeFileXLSX(workbook, fileName, {
        bookType: 'xlsx',
        type: 'base64',
    });
}

// getDatas().then(() => {
//     makeExcel(dataSet).then(() => {
//         console.log('end excel maker');
//     });
// });

getDatas();
