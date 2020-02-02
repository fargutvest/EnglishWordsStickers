import React, { Component } from 'react';
import Pdf from "react-to-pdf";
import s from './DataAccess.module.css'
import cs from './../Common.module.css'

const options = {
  orientation: 'landscape'
};

class DataAccess extends Component {
  constructor(props) {
    super(props);
    this.getSuccess = this.getSuccess.bind(this);
    this.getFail = this.getFail.bind(this);
    this.listMajors = this.listMajors.bind(this);
    this.handleListMajorsClick = this.handleListMajorsClick.bind(this);
    this.appendPre = this.appendPre.bind(this);
    this.visitWoordhunt = this.visitWoordhunt.bind(this);
  }

  handleListMajorsClick(event) {
    this.listMajors();
  }

  // private static void VisitWooordhunt(string en, out string spell, out string rus)
  // {
  //     spell = "";
  //     rus = "";
  //     try
  //     {
  //         var url = $"http://wooordhunt.ru/word/{en}";
  //         var web = new XmlDocument();
  //         web.Load(url);
  //         spell = web.DocumentElement.SelectSingleNode("//*[@id=\"uk_tr_sound\"]/span[1]")?.InnerText ?? "";
  //         rus = web.DocumentElement.SelectSingleNode("//*[@id=\"wd_content\"]/span/text()")?.InnerText ?? "";
  //     }
  //     catch (Exception)
  //     {
  //         // ignored
  //     }
  // }

  visitWoordhunt(eng) {
    var url = `https://wooordhunt.ru/word/${eng}`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = this.getInfo;
    xmlHttp.open( "GET", url, false );
    xmlHttp.send();
    var responseText = xmlHttp.responseText;
    return responseText;
  }

  getData() {
    // create a new XMLHttpRequest
    var xhr = new XMLHttpRequest()

    // get a callback when the server responds
    xhr.addEventListener('load', () => {
      // update the state of the component with the result here
      console.log(xhr.responseText)
    })
    // open the request with the verb and the url
    xhr.open('GET', 'https://wooordhunt.ru')
    // send the request
    xhr.send()
  }

  getInfo(resp) {
		// if (request.readyState == 4) {
		// 	var val = request.responseText;
		// 	document.getElementById('chiru').innerHTML = val;
		// }
  }
  
  listMajors() {
    var SPREADSHEET_ID = document.getElementById('SPREADSHEET_ID').value;

    this.updateLocalStorage();
    window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "C:D",
    }).then(this.getSuccess, this.getFail);
  }

  getSuccess(response) {
    var values = response.result.values;
    var words = [];
    if (values.length > 0) {
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        words.push(row);
      }
    } else {
      this.appendPre('No data found.');
    }

    var stickersToShare = [];
    var rowCounter = 0;
    var wordsCounter = 0;
    var rowModel = [];
    words.forEach(element => {
      rowCounter++;
      wordsCounter++;
      rowModel.push({
        English: element[0],
        Spelling: "---",
        Russian: element[1]
      })
      if (rowCounter == 4 || words.length - wordsCounter == 0) {
        var need = 4 - rowModel.length;
        if (need > 0) {
          for (var i = 0; i < need; i++) {
            rowModel.push({
              English: "---",
              Spelling: "---",
              Russian: "---"
            })
          }
        }
        stickersToShare.push(rowModel);
        rowModel = [];
        rowCounter = 0;

      }
    });
    this.props.updateShared(stickersToShare);
  }

  getFail(response) {
    this.appendPre('Error: ' + response.result.error.message);
  }


  updateLocalStorage() {
    var SPREADSHEET_ID = document.getElementById('SPREADSHEET_ID').value;
    localStorage.setItem('SPREADSHEET_ID', SPREADSHEET_ID);
  }

  getSnapshotBeforeUpdate() {
    if (this.props.spreedSheetId) {
      var elem = document.getElementById('SPREADSHEET_ID');
      elem.value = this.props.spreedSheetId;
    }
  }

  componentDidMount() {
    var params = this.props.params;

    var elem = document.getElementById('SPREADSHEET_ID');
    elem.value = params.SPREADSHEET_ID ? params.SPREADSHEET_ID : localStorage.getItem('SPREADSHEET_ID');
  }

  appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }

  render() {
    return (
      <div>
        <table width="100%"> 
          <tr>
            <td width="70%">
              <label className="w3-text-blue"><b>SPREADSHEET_ID:</b></label>
              <input className="w3-input w3-border" id="SPREADSHEET_ID" type="text" size="100" />
            </td>
            <td width="12%">
              <button id="list_majors" className={cs.button} onClick={this.handleListMajorsClick}>Read Spredsheet</button>
            </td>
            <td width="12%">
              <Pdf id="id_pdf" targetRef={this.props.da_ref} filename="stickers.pdf" options={options} x={2} y={2}>
                {({ toPdf }) => <button id="pdf" className={cs.button} onClick={toPdf}>Dowdload Pdf</button>}
              </Pdf>
            </td>
          </tr>
        </table>
        <pre id="content" className={s.error}></pre>
      </div>
    );
  }


}

export default DataAccess;